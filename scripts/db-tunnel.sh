#!/bin/bash

# SSM Session Manager ポートフォワーディングスクリプト
# RDS PostgreSQLへの接続をローカルポート5432で転送

set -e

# AWSプロファイルの設定（環境変数から取得、未設定の場合はエラー）
if [ -z "$AWS_PROFILE" ]; then
    echo "Error: AWS_PROFILE environment variable is not set."
    echo "Please set AWS_PROFILE environment variable:"
    echo "  export AWS_PROFILE=your-profile-name"
    echo "  or"
    echo "  AWS_PROFILE=your-profile-name pnpm db:tunnel"
    exit 1
fi

echo "Using AWS Profile: $AWS_PROFILE"

# 環境変数からBastion Instance IDを取得
echo "Retrieving Bastion Instance ID..."
BASTION_INSTANCE_ID=$(aws ssm get-parameter --region us-east-1 --name "/rr7-better-auth/bastion/instance-id" --query 'Parameter.Value' --output text 2>&1)

if [ $? -ne 0 ]; then
    echo "Error: Failed to retrieve Bastion Instance ID."
    echo "AWS CLI error: $BASTION_INSTANCE_ID"
    echo "Possible causes:"
    echo "  1. AWS_PROFILE is not set or invalid"
    echo "  2. CDK stack is not deployed"
    echo "  3. Parameter '/rr7-better-auth/bastion/instance-id' does not exist"
    echo "  4. AWS credentials are invalid or expired"
    echo ""
    echo "Please check your AWS credentials and deploy the CDK stack first."
    exit 1
fi

if [ -z "$BASTION_INSTANCE_ID" ] || [ "$BASTION_INSTANCE_ID" = "None" ]; then
    echo "Error: Bastion Instance ID is empty or 'None'."
    echo "Please deploy the CDK stack first."
    exit 1
fi

# RDSエンドポイントを取得
echo "Retrieving RDS endpoint..."
RDS_ENDPOINT=$(aws ssm get-parameter --region us-east-1 --name "/rr7-better-auth/database/endpoint" --query 'Parameter.Value' --output text 2>&1)

if [ $? -ne 0 ]; then
    echo "Error: Failed to retrieve RDS endpoint."
    echo "AWS CLI error: $RDS_ENDPOINT"
    echo "Please deploy the CDK stack first."
    exit 1
fi

if [ -z "$RDS_ENDPOINT" ] || [ "$RDS_ENDPOINT" = "None" ]; then
    echo "Error: RDS endpoint is empty or 'None'."
    echo "Please deploy the CDK stack first."
    exit 1
fi

echo "Starting SSM port forwarding to RDS PostgreSQL..."
echo "Bastion Instance ID: $BASTION_INSTANCE_ID"
echo "RDS Endpoint: $RDS_ENDPOINT"
echo "Local port: 5432"
echo "Remote port: 5432"
echo ""
echo "Press Ctrl+C to stop the tunnel"
echo ""

# SSM Session Managerでポートフォワーディング開始
echo "Starting SSM session..."
aws ssm start-session \
    --region us-east-1 \
    --target "$BASTION_INSTANCE_ID" \
    --document-name AWS-StartPortForwardingSessionToRemoteHost \
    --parameters "{\"host\":[\"$RDS_ENDPOINT\"],\"portNumber\":[\"5432\"],\"localPortNumber\":[\"5432\"]}"
