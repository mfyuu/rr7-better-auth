# React Router v7 + Better Auth

React Router v7にBetter Authを使ったGoogle OAuth認証を実装したプロジェクト（Amazon RDS PostgreSQL使用）

## 概要

本プロジェクトは、React Router v7とBetter Authを使用してGoogle OAuth認証を実装したWebアプリケーションです。Amazon RDS PostgreSQLをデータベースとして使用し、SSM Session Managerを経由した安全な接続を提供します。

## 🚀 クイックスタート

```bash
# 1. 依存関係のインストール
pnpm install

# 2. AWS CDKスタックデプロイ
pnpm run deploy

# 3. SSMポートフォワーディング起動（別ターミナル）
pnpm run db:tunnel

# 4. データベースセットアップ
pnpm run setup

# 5. 開発サーバー起動
pnpm dev
```

## 📋 詳細セットアップ

```bash
# 1. 依存関係のインストール
pnpm install

# 2. 環境変数の設定
cp .env.example .env

# 3. AWS CDKスタックデプロイ
pnpm run deploy

# 4. SSMポートフォワーディング起動（別ターミナル）
pnpm run db:tunnel

# 5. データベースセットアップ
pnpm run db:generate && pnpm run db:migrate

# 6. 開発サーバー起動
pnpm dev
```

## 📋 詳細セットアップ

### 1. 依存関係のインストール

```bash
pnpm install
```

### 2. AWS CDKスタックのデプロイ

Amazon RDS PostgreSQLとBastion EC2をデプロイ：

```bash
cd infra
pnpm run deploy
```

デプロイ完了後、以下の情報を取得：
- RDSエンドポイント
- Bastion Instance ID
- データベース認証情報（Secrets Manager）

### 3. 環境変数の設定

`.env.example`をコピーして`.env`を作成し、必要な設定を行います：

```bash
cp .env.example .env
```

Google OAuth認証情報とデータベース接続情報を設定：

```env
# Google OAuth設定
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# データベース設定（SSMポートフォワーディング経由）
DATABASE_URL=postgresql://better_auth:password@localhost:5432/better_auth
```

### 4. SSM Session Manager Pluginのインストール

AWS CLIとSession Manager Pluginをインストール：

```bash
# macOS
brew install --cask session-manager-plugin

# Linux
# https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager-working-with-install-plugin.html
```

### 5. データベースのセットアップ

SSMポートフォワーディングを起動（別ターミナル）：

```bash
pnpm run db:tunnel
```

スキーマを生成：

```bash
pnpm run db:generate
```

マイグレーションを実行：

```bash
pnpm run db:migrate
```

## 開発

開発サーバーを起動：

```bash
pnpm dev
```

ブラウザで `http://localhost:5173` にアクセス

## 🗄️ Amazon RDS PostgreSQL管理

### データベース接続

```bash
# SSMポートフォワーディング起動
pnpm run db:tunnel

# データベース接続（別ターミナルでポートフォワーディング実行後）
psql postgresql://better_auth:password@localhost:5432/better_auth
```

### スキーマ管理

```bash
# スキーマ生成
pnpm run db:generate

# マイグレーション実行
pnpm run db:migrate
```

### AWSリソース管理

```bash
# CDKスタックデプロイ
cd infra && pnpm run deploy

# CDKスタック削除
cd infra && pnpm run destroy

# RDS接続情報取得
aws ssm get-parameter --name "/rr7-better-auth/database/endpoint"
aws secretsmanager get-secret-value --secret-id rr7-better-auth-db-secret
```

## 🛠️ 開発ツール

### コード品質

```bash
# 型チェック
pnpm run typecheck

# リント
pnpm run lint

# フォーマット
pnpm run format

# 一括チェック
pnpm run check
```

### ビルド・デプロイ

```bash
# ビルド
pnpm run build

# 本番サーバー起動
pnpm run start
```

## 🚨 トラブルシューティング

### 開発サーバーの停止

ローカルサーバーを停止するには：

```bash
# better-auth専用の停止（ポート5173-5179）
pnpm run stop
```

### 停止対象

- **ポート範囲**: 5173-5179（better-auth専用）
- **プロセス**: `react-router.*dev`, `vite.*dev`, `better-auth`

### プロセスが停止しない場合

```bash
# プロセス確認
lsof -i :5173

# 手動停止
kill -9 <PID>
```

## 📚 技術スタック

- **フレームワーク**: React Router v7
- **認証**: Better Auth
- **データベース**: Amazon RDS PostgreSQL 16
- **インフラ**: AWS CDK
- **接続**: SSM Session Manager + ポートフォワーディング
- **パッケージマネージャー**: pnpm
- **言語**: TypeScript

## 💰 コスト試算

- RDS t4g.micro: ~$13/月
- Bastion t4g.nano: ~$3/月
- ストレージ 20GB: ~$2.3/月
- Secrets Manager: ~$0.40/月
- **合計: ~$19/月**

## 🔧 開発者向け情報

### アーキテクチャ

- **フロントエンド**: React Router v7 + TypeScript
- **認証**: Better Auth + Google OAuth
- **データベース**: Amazon RDS PostgreSQL 16
- **インフラ**: AWS CDK (TypeScript)
- **接続**: SSM Session Manager + ポートフォワーディング

### 主要ファイル

- `lib/auth.ts`: Better Auth設定（サーバーサイド）
- `lib/auth-client.ts`: Better Authクライアント設定（フロントエンド）
- `infra/`: AWS CDKインフラストラクチャ定義
- `scripts/`: データベース接続・管理スクリプト

## ⚠️ 注意事項

- バックアップ無効構成（開発環境のみ推奨）
- SSMポートフォワーディングは開発時のみ起動
- AWS CLIとSession Manager Pluginのインストールが必要
