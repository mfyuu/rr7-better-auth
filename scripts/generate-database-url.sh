#!/bin/bash

echo "🔧 DATABASE_URLを生成中..."

source .env

TOKEN=$(AWS_PROFILE=poc-ops aws dsql generate-db-connect-admin-auth-token --hostname $DSQL_ENDPOINT --region $AWS_REGION)

DATABASE_URL="postgresql://admin:${TOKEN}@${DSQL_ENDPOINT}:${DSQL_PORT}/${DSQL_DATABASE}?sslmode=require"

if grep -q "DATABASE_URL=" .env; then
    sed -i "s|DATABASE_URL=.*|DATABASE_URL=${DATABASE_URL}|" .env
else
    echo "DATABASE_URL=${DATABASE_URL}" >> .env
fi

echo "✅ DATABASE_URLが生成されました"
echo "   URL: postgresql://admin:***@${DSQL_ENDPOINT}:${DSQL_PORT}/${DSQL_DATABASE}?sslmode=require"
