#!/bin/bash

# .envファイルを自動更新するスクリプト
# Amazon DSQLクラスターの接続情報を設定

set -e

echo "🔧 .envファイルを更新中..."

# AWSプロファイルの確認
if [ -z "$AWS_PROFILE" ]; then
    echo "Error: AWS_PROFILE environment variable is not set."
    echo "Please set AWS_PROFILE environment variable:"
    echo "  export AWS_PROFILE=your-profile-name"
    exit 1
fi

echo "Using AWS Profile: $AWS_PROFILE"

# Amazon DSQLクラスター情報を取得
echo "Retrieving Amazon DSQL cluster information..."

# DSQLエンドポイント
DSQL_ENDPOINT=$(aws ssm get-parameter --region us-east-1 --name "/rr7-better-auth/dsql/endpoint" --query 'Parameter.Value' --output text 2>/dev/null)
if [ $? -ne 0 ] || [ -z "$DSQL_ENDPOINT" ]; then
    echo "Error: Failed to retrieve DSQL endpoint."
    echo "Please ensure the CDK stack is deployed."
    exit 1
fi

# DSQLポート
DSQL_PORT=$(aws ssm get-parameter --region us-east-1 --name "/rr7-better-auth/dsql/port" --query 'Parameter.Value' --output text 2>/dev/null)
if [ $? -ne 0 ] || [ -z "$DSQL_PORT" ]; then
    echo "Error: Failed to retrieve DSQL port."
    exit 1
fi

# DSQLデータベース名
DSQL_DATABASE=$(aws ssm get-parameter --region us-east-1 --name "/rr7-better-auth/dsql/database" --query 'Parameter.Value' --output text 2>/dev/null)
if [ $? -ne 0 ] || [ -z "$DSQL_DATABASE" ]; then
    echo "Error: Failed to retrieve DSQL database name."
    exit 1
fi

# DSQLクラスターARN
DSQL_CLUSTER_ARN=$(aws ssm get-parameter --region us-east-1 --name "/rr7-better-auth/dsql/cluster-arn" --query 'Parameter.Value' --output text 2>/dev/null)
if [ $? -ne 0 ] || [ -z "$DSQL_CLUSTER_ARN" ]; then
    echo "Error: Failed to retrieve DSQL cluster ARN."
    exit 1
fi

# DSQLクラスターID
DSQL_CLUSTER_ID=$(echo "$DSQL_CLUSTER_ARN" | cut -d'/' -f2)

echo "Amazon DSQL cluster information retrieved:"
echo "  Endpoint: $DSQL_ENDPOINT"
echo "  Port: $DSQL_PORT"
echo "  Database: $DSQL_DATABASE"

# .envファイルを更新
echo "Updating .env file..."

# 既存の.envファイルをバックアップ
if [ -f .env ]; then
    cp .env .env.backup
    echo "  Backed up existing .env to .env.backup"
fi

# 新しい.envファイルを作成
cat > .env << EOF
BETTER_AUTH_SECRET=dev-secret-key-1761372177
# =============================================================================
# Better Auth Configuration
# =============================================================================

# Better Auth Secret Key
# セッション暗号化に使用する秘密鍵（本番環境では強力なランダム文字列を設定）

# Better Auth Base URL
# アプリケーションのベースURL（本番環境では実際のドメインを設定）
BETTER_AUTH_URL=http://localhost:5173

# =============================================================================
# Amazon DSQL Configuration
# =============================================================================

# Amazon DSQL接続情報
# IAM認証を使用してAmazon DSQLクラスターに接続
DSQL_ENDPOINT=${DSQL_ENDPOINT}
DSQL_PORT=${DSQL_PORT}
DSQL_DATABASE=${DSQL_DATABASE}
DSQL_CLUSTER_ARN=${DSQL_CLUSTER_ARN}
DSQL_CLUSTER_ID=${DSQL_CLUSTER_ID}

# AWS Region
AWS_REGION=us-east-1

# =============================================================================
# Google OAuth Configuration
# =============================================================================

# Google OAuth認証情報
# 取得先: https://console.cloud.google.com/apis/credentials
# 1. Google Cloud Consoleでプロジェクトを作成
# 2. OAuth 2.0 クライアントIDを作成
# 3. 承認済みリダイレクトURIに以下を追加:
#    - http://localhost:5173/api/auth/callback/google
#    - https://yourdomain.com/api/auth/callback/google (本番環境)

# Google OAuth
# Get credentials from: https://console.cloud.google.com/apis/credentials
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Vite environment variables
VITE_BETTER_AUTH_URL=http://localhost:5173
EOF

echo "✅ .envファイルが更新されました"
echo "   DSQL_ENDPOINT=${DSQL_ENDPOINT}"
echo "   DSQL_PORT=${DSQL_PORT}"
echo "   DSQL_DATABASE=${DSQL_DATABASE}"
