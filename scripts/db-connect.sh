#!/bin/bash

# データベース接続情報を動的に取得するスクリプト
# SSMトンネル経由でRDSに接続するための環境変数を設定

set -e

# AWSプロファイルの確認
if [ -z "$AWS_PROFILE" ]; then
    echo "Error: AWS_PROFILE environment variable is not set."
    echo "Please set AWS_PROFILE environment variable:"
    echo "  export AWS_PROFILE=your-profile-name"
    exit 1
fi

echo "Using AWS Profile: $AWS_PROFILE"

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

# データベース接続パラメータを設定（SSMトンネル経由）
export DB_HOST="localhost"
export DB_PORT="5432"
export DB_NAME="better_auth"
export DB_USER="${USERNAME}"
export DB_PASSWORD="${PASSWORD}"

echo "Database connection configured for localhost:5432"
echo "Username: $USERNAME"
echo "Endpoint: $RDS_ENDPOINT (via SSM tunnel)"

# 引数として渡されたコマンドを実行
exec "$@"
