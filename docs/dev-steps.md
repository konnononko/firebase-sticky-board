# MVP 開発手順（dev-steps）

このドキュメントは、`firebase-sticky-board` の  
**MVP（最小実用プロダクト）を数時間で完成させるための作業手順メモ**です。

目的は、Firebase を使ったリアルタイム Web アプリを  
**最短で「動く形」にすること**です。

---

## MVP のゴール

以下を満たした状態を MVP 完成とします。

- ホワイトボード画面が表示される
- 付箋を作成時にテキスト入力して追加できる
- 付箋をドラッグして移動できる
- 複数ブラウザで位置がリアルタイムに同期される
- Firebase Hosting で公開されている

---

## アーキテクチャ（MVP）

- フロントエンド: React + TypeScript（Vite）
- バックエンド / BaaS: Firebase
  - Cloud Firestore
  - Firebase Hosting
- リアルタイム同期: Firestore の onSnapshot
- ボード構成: シングルボード（boardId 固定）

---

## 開発手順

### 1. Firebase プロジェクト準備

- Firebase Console で新規プロジェクトを作成
- Cloud Firestore を有効化（テストモード）
- Web アプリを登録し、`firebaseConfig` を取得

スコープ：
- 認証設定は行わない
- 課金設定は行わない
- 厳密なセキュリティルールは後回しにする

---

### 2. リポジトリ作成とフロントエンド初期化

- GitHub リポジトリを作成: `firebase-sticky-board`
- Vite + React + TypeScript でプロジェクトを初期化
- Firebase SDK を追加

```bash
npm create vite@latest firebase-sticky-board
cd firebase-sticky-board
npm install
npm install firebase
````

* `src/firebase.ts` に Firebase 初期化処理を記述する

---

### 3. Firestore データ設計

MVP ではシングルボード構成とする。

- boardId: `"default"`（固定）

Firestore の構成：

```
boards/default/notes/{noteId}
```

付箋（note）の最小フィールド：

- text: string
- x: number
- y: number
- createdAt
- updatedAt

---

### 4. 付箋の購読と描画

- Firestore の `notes` コレクションを `onSnapshot()` で購読
- 取得した付箋データを state に保持
- ボード上に absolute 配置で描画

補足：

- UI は最小限でよい
- デザインは後回しにする

---

### 5. 付箋の作成（テキスト入力）

- 「付箋追加」ボタンを用意
- モーダルまたは簡易フォームでテキストを入力
- 確定時に `addDoc()` で Firestore に保存

ルール：

- テキストは必須（空文字不可）
- 作成後のテキスト編集は行わない

---

### 6. 付箋のドラッグ移動

基本方針：

- ドラッグ中はローカル state のみ更新
- ドラッグ終了時にのみ Firestore を更新

実装のポイント：

- pointerdown / pointermove / pointerup を使用
- 掴んでいる付箋の noteId とオフセットを管理
- マウス移動ごとに Firestore へ書き込まない

---

### 7. リアルタイム同期の安定化

- 自分がドラッグ中の付箋は、購読データよりローカル状態を優先表示
- ドラッグ終了後に、再び購読データに追従させる

目的：

- 自分の操作と他ユーザーの更新が干渉しないこと

---

### 8. Firebase Hosting へのデプロイ

- Firebase CLI をインストール
- Hosting を初期化
- ビルドしてデプロイ

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

- 公開 URL を確認する

---

## 想定作業時間

- Firebase 準備: 約10分
- フロントエンド初期化: 約15分
- Firestore 購読・描画: 約30分
- 付箋作成: 約30分
- ドラッグ移動: 約60分
- 同期調整: 約20分
- デプロイ: 約20分

合計: 約3〜5時間

---

## MVP のスコープ外

以下は MVP では扱わない。

- 認証（Authentication）
- 複数ボード対応
- 作成後のテキスト編集
- Undo / Redo
- CRDT や複雑な同時編集制御
- 細かな UI / デザイン調整

これらは将来拡張の候補として README に記載するのみとする。

---

## 完成チェックリスト

- [ ] 初期テキスト付きで付箋を作成できる
- [ ] 付箋をドラッグして移動できる
- [ ] 複数ブラウザで同期される
- [ ] Firebase Hosting で公開されている
- [ ] README が存在する

---

## 補足

このドキュメントは、速度と分かりやすさを最優先としています。
まず MVP を完成させ、その後に拡張を検討してください。
