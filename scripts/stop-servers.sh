#!/bin/bash

# better-auth専用ローカルサーバー停止スクリプト
# ポート5173-5179で動作しているNode.jsプロセスを停止します

echo "🛑 ローカルサーバーを停止中..."

# 停止対象のポートリスト (better-auth専用: 5173-5179)
PORTS=(5173 5174 5175 5176 5177 5178 5179)

# 各ポートで動作しているプロセスを停止
for port in "${PORTS[@]}"; do
    # ポートを使用しているプロセスのPIDを取得
    pid=$(lsof -ti:$port 2>/dev/null)

    if [ ! -z "$pid" ]; then
        echo "📡 ポート $port で動作中のプロセス (PID: $pid) を停止中..."
        kill -TERM $pid 2>/dev/null

        # 3秒待機してプロセスが停止したか確認
        sleep 3

        # まだ動作している場合は強制終了
        if kill -0 $pid 2>/dev/null; then
            echo "⚠️  プロセスが停止しませんでした。強制終了します..."
            kill -KILL $pid 2>/dev/null
        fi

        echo "✅ ポート $port のプロセスを停止しました"
    else
        echo "ℹ️  ポート $port ではプロセスが動作していません"
    fi
done

# better-auth関連のNode.jsプロセスを直接停止
echo "🔍 better-auth関連プロセスを確認中..."
node_pids=$(pgrep -f "react-router.*dev\|vite.*dev\|better-auth" 2>/dev/null)

if [ ! -z "$node_pids" ]; then
    echo "📡 開発サーバープロセスを停止中..."
    echo "$node_pids" | xargs kill -TERM 2>/dev/null

    # 3秒待機
    sleep 3

    # まだ動作している場合は強制終了
    remaining_pids=$(pgrep -f "react-router.*dev\|vite.*dev\|better-auth" 2>/dev/null)
    if [ ! -z "$remaining_pids" ]; then
        echo "⚠️  一部のプロセスが停止しませんでした。強制終了します..."
        echo "$remaining_pids" | xargs kill -KILL 2>/dev/null
    fi

    echo "✅ better-auth関連プロセスを停止しました"
else
    echo "ℹ️  動作中のbetter-auth関連プロセスはありません"
fi

echo "🎉 better-authサーバーの停止が完了しました！"
