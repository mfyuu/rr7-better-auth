#!/bin/bash

# 開発サーバー用の環境変数設定スクリプト
# データベース接続情報を動的に取得して開発サーバーを起動

set -e

# AWSプロファイルの設定（デフォルト値）
if [ -z "$AWS_PROFILE" ]; then
    export AWS_PROFILE=poc-ops
    echo "Using default AWS Profile: $AWS_PROFILE"
else
    echo "Using AWS Profile: $AWS_PROFILE"
fi

# RDS接続情報を取得
echo "Retrieving database credentials..."

# データベースエンドポイント
RDS_ENDPOINT=$(aws ssm get-parameter --region us-east-1 --name "/rr7-better-auth/database/endpoint" --query 'Parameter.Value' --output text 2>/dev/null)
if [ $? -ne 0 ] || [ -z "$RDS_ENDPOINT" ]; then
    echo "Error: Failed to retrieve RDS endpoint."
    echo "Please ensure the CDK stack is deployed."
    exit 1
fi

# データベース認証情報
SECRET_JSON=$(aws secretsmanager get-secret-value --secret-id $(aws ssm get-parameter --name "/rr7-better-auth/database/secret-arn" --region us-east-1 --query 'Parameter.Value' --output text) --region us-east-1 --query 'SecretString' --output text 2>/dev/null)
if [ $? -ne 0 ] || [ -z "$SECRET_JSON" ]; then
    echo "Error: Failed to retrieve database credentials."
    exit 1
fi

# JSONから認証情報を抽出
USERNAME=$(echo "$SECRET_JSON" | jq -r '.username')
PASSWORD=$(echo "$SECRET_JSON" | jq -r '.password')

# .envファイルを読み込み
if [ -f ".env" ]; then
    echo "Loading environment variables from .env file..."
    export $(grep -v '^#' .env | xargs)
fi

# データベース接続パラメータを設定（SSMトンネル経由）
export DB_HOST="localhost"
export DB_PORT="5432"
export DB_NAME="better_auth"
export DB_USER="${USERNAME}"
export DB_PASSWORD="${PASSWORD}"

# Better Auth設定
export BETTER_AUTH_URL="http://localhost:5173"
export BETTER_AUTH_SECRET="${BETTER_AUTH_SECRET:-your-secret-key-here}"

# Google OAuth設定（.envファイルから読み込み）
export GOOGLE_CLIENT_ID="${GOOGLE_CLIENT_ID}"
export GOOGLE_CLIENT_SECRET="${GOOGLE_CLIENT_SECRET}"

# Google OAuth設定の確認
if [ -z "$GOOGLE_CLIENT_ID" ] || [ -z "$GOOGLE_CLIENT_SECRET" ]; then
    echo "Warning: Google OAuth credentials not set."
    echo "Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables."
    echo "Google OAuth will not work without proper credentials."
fi

echo "Database connection configured for localhost:5432"
echo "Username: $USERNAME"
echo "Endpoint: $RDS_ENDPOINT (via SSM tunnel)"
echo "Better Auth URL: $BETTER_AUTH_URL"
echo "Starting development server..."

# 開発サーバーを起動
exec pnpm react-router dev
