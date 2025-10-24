# React Router v7 + Better Auth

React Router v7にBetter Authを使ったGoogle OAuth認証を実装したプロジェクト

## セットアップ

### 1. 依存関係のインストール

```bash
pnpm install
```

### 2. 環境変数の設定

`.env.example`をコピーして`.env`を作成し、Google OAuth認証情報を設定：

```bash
cp .env.example .env
```

Google Cloud Consoleで取得したクライアントIDとシークレットを設定：

```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### 3. データベースのセットアップ

スキーマを生成：

```bash
pnpm dlx @better-auth/cli@latest generate --config ./lib/auth.ts
```

マイグレーションを実行：

```bash
pnpm dlx @better-auth/cli@latest migrate --config ./lib/auth.ts
```

## 開発

開発サーバーを起動：

```bash
pnpm dev
```

ブラウザで `http://localhost:5173` にアクセス

## サーバー管理

### 開発サーバーの停止

ローカルサーバーを停止するには：

```bash
# better-auth専用の停止（ポート5173-5179）
pnpm stop
# または
pnpm stop:all
```

### 停止対象

- **ポート範囲**: 5173-5179（better-auth専用）
- **プロセス**: `react-router.*dev`, `vite.*dev`, `better-auth`

### トラブルシューティング

プロセスが停止しない場合：

```bash
# プロセス確認
lsof -i :5173

# 手動停止
kill -9 <PID>
```
