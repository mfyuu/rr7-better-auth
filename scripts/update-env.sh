#!/bin/bash

# .envファイルを自動更新するスクリプト
# SSMポートフォワーディング後に実行して、正しいデータベース認証情報を設定

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

# データベース認証情報を取得
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

# パスワードをURLエンコード
ENCODED_PASSWORD=$(echo "$PASSWORD" | sed 's/`/%60/g; s/!/%21/g; s/&/%26/g; s/\[/%5B/g; s/\]/%5D/g; s/#/%23/g; s/\$/%24/g')

echo "Database credentials retrieved:"
echo "  Username: $USERNAME"
echo "  Endpoint: $RDS_ENDPOINT (via SSM tunnel)"

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
# Database Configuration
# =============================================================================

# PostgreSQL Database URL
# 形式: postgresql://ユーザー名:パスワード@ホスト:ポート/データベース名
# SSMポートフォワーディング経由でlocalhost:5432に接続
DATABASE_URL=postgresql://${USERNAME}:${ENCODED_PASSWORD}@localhost:5432/better_auth

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
echo "   DATABASE_URL=postgresql://${USERNAME}:***@localhost:5432/better_auth"
