# 工数管理アプリ

プロジェクト・タスク単位で作業時間を記録できる、シンプルな工数管理Webアプリです。

## 機能

- **プロジェクト・タスク管理** — カラー付きでプロジェクトを登録し、タスクを紐付け
- **タイマー** — ワンタップで作業開始・停止。手動入力にも対応
- **レポート** — 日次・週次・月次で工数を集計。CSV出力も可能
- **データはブラウザに保存** — サーバー不要、完全無料で動作
- **スマホ対応** — モバイルブラウザでも快適に使えるレスポンシブデザイン

## 技術スタック

- React 18 + TypeScript
- Vite
- Tailwind CSS
- localStorage（データ永続化）
- GitHub Actions（自動デプロイ）

---

## セットアップ手順

### 1. リポジトリを作成

GitHub で新しいリポジトリを作成してください（例: `kosu-app`）。

### 2. `vite.config.ts` のベースURLを変更

```ts
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  base: '/あなたのリポジトリ名/',  // ← ここを変更
})
```

### 3. GitHubにプッシュ

```bash
git init
git add .
git commit -m "初回コミット"
git branch -M main
git remote add origin https://github.com/あなたのGitHubユーザー名/リポジトリ名.git
git push -u origin main
```

### 4. GitHub Pages の設定

1. GitHubリポジトリの **Settings** → **Pages** を開く
2. Source を **GitHub Actions** に変更する
3. 数分後、`https://あなたのGitHubユーザー名.github.io/リポジトリ名/` でアクセス可能になります

---

## ローカル開発

```bash
npm install
npm run dev
```

## ビルド

```bash
npm run build
```

## ライセンス

MIT
