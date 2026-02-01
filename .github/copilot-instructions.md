# Copilot Instructions for firebase-sticky-board

このリポジトリは、  
Firebase を使った付箋ホワイトボードWebアプリ です。

MVP を完了し、次フェーズでは「共有リンク共同編集」と「認証・権限」を最小コストで追加します。

目的：
- 実装をできるだけシンプルに保つ
- 完成度より「意図が分かる構成」を優先する
- 過剰な設計や先回り実装を避ける
- 既存の動作を壊さず、小さなステップで拡張する

開発は `docs/dev-steps*.md` に従って進めます。  
`copilot-instructions.md` や `README.md` への方針・知見の反映が適切な場面では、更新内容を提案してください。

## アーキテクチャ概要

- React + TypeScript（Vite）
- Firebase Cloud Firestore（永続化・リアルタイム同期）
- Firebase Hosting（デプロイ）
- Firebase Authentication（認証）
- Firebase Security Rules（権限）

Firestore 構成：
- `boards/{boardId}/notes/{noteId}`

ルーティング：
- `/` : ボード作成（オーナーは非匿名ログイン必須）
- `/b/:boardId` : ボード閲覧・編集（参加者は匿名で可）

## コアの制約（重要）

付箋のテキスト：
- 作成時のみ入力
- 作成後は編集不可

リアルタイム同期：
- Firestore の `onSnapshot` を使用
- Last Write Wins を前提とする

ドラッグ挙動：
- ドラッグ中はローカル state のみ更新
- ドラッグ終了時にのみ Firestore に保存
- マウス移動ごとに Firestore に書き込まない

共有モデル：
- 共有リンク方式（boardId を URL に含める）
- 「リンクを知っている人は編集できる」を前提とする
- 招待管理（メンバー一覧、権限付与 UI）は実装しない

認証モデル：
- 参加者：匿名ログインで可
- オーナー（ボード作成者）：非匿名ログイン必須（例：Google）
- UI 側の制御だけでなく、Security Rules 側でも制約を保証する

やらないこと：
- CRDT や複雑な同時編集制御
- 不要な抽象化やレイヤー分割
- 早すぎる最適化（キャッシュ・状態管理ライブラリ導入など）
- 「将来のため」の大規模なリファクタリング

## 実装方針

- 基本はシンプルな React Hooks（`useState`, `useEffect`）
- Firestore へのアクセスは、使われる箇所の近くに書く（重い層は作らない）
- ただし、認証・Firestore 参照パス（boardId）の取り回しが増えたら 最小限の関数分割（例：`getNotesCollectionRef(boardId)`）は許容する
- 「賢さ」よりも「読みやすさ」を優先する
- TypeScript の型は最小限だが明示的に書く

## 次フェーズで追加する機能（スコープ）

- 付箋削除
- 付箋の色（color）追加・変更
- 共有リンク（`/b/:boardId`）
- 認証（匿名 + 非匿名）
- Firestore security rules

注意：
- 書き込み回数を増やしすぎない
- ルールは段階的に強化し、最初から厳密にしすぎない

## 将来拡張の方向性（ただし今は作りこまない）

- 共有の強度を上げる（トークン方式 / 招待方式）
- 認証の追加（Google/GitHub、匿名からの昇格）
- ボード一覧、メンバー管理
- App Check、簡易的なスパム対策
- Emulator / CI による Rules テスト
- CI（GitHub Actions）によるビルド・デプロイ自動化

設計上は拡張可能性を意識しつつ、
実装は今のスコープに収めてください。
