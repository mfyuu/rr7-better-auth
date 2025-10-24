# React Router v7 + Better Auth

React Router v7にBetter Authを使ったGoogle OAuth認証を実装したプロジェクト

## 🚀 クイックスタート

```bash
# 1. 依存関係のインストール
pnpm install

# 2. 環境変数の設定
cp .env.example .env

# 3. 一括セットアップ（PostgreSQL起動 + スキーマ生成 + マイグレーション）
pnpm run setup

# 4. 開発サーバー起動
pnpm dev
```

## 📋 詳細セットアップ

### 1. 依存関係のインストール

```bash
pnpm install
```

### 2. PostgreSQL環境の構築

Docker Composeを使用してPostgreSQLを起動：

```bash
pnpm run db:up
```

PostgreSQLが起動するまで少し待ってから次のステップに進んでください。

### 3. 環境変数の設定

`.env.example`をコピーして`.env`を作成し、Google OAuth認証情報を設定：

```bash
cp .env.example .env
```

Google Cloud Consoleで取得したクライアントIDとシークレットを設定：

```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### 4. データベースのセットアップ

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

## 🗄️ PostgreSQL管理

### データベース操作

```bash
# PostgreSQL起動
pnpm run db:up

# PostgreSQL停止
pnpm run db:down

# データのリセット（全データ削除）
pnpm run db:reset

# ログ確認
pnpm run db:logs

# データベース接続
pnpm run db:connect
```

### スキーマ管理

```bash
# スキーマ生成
pnpm run db:generate

# マイグレーション実行
pnpm run db:migrate
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
- **データベース**: PostgreSQL 16
- **コンテナ**: Docker Compose
- **パッケージマネージャー**: pnpm
- **言語**: TypeScript
