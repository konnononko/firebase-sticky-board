# Copilot Instructions for firebase-sitcky-board

このリポジトリは、  
**Firebase を使った付箋ホワイトボードWebアプリのMVP** です。

目的は以下です：
- 実装をできるだけシンプルに保つ
- 完成度より「意図が分かる構成」を優先する
- 過剰な設計や先回り実装を避ける

## アーキテクチャ概要

- React + TypeScript（Vite）
- Firebase Cloud Firestore（永続化・リアルタイム同期）
- Firebase Hosting（デプロイ）

Firestore 構成：
- `boards/{boardId}/notes/{noteId}`

## MVPにおける制約（重要）

- 付箋のテキスト：
  - **作成時のみ入力**
  - 作成後は **編集不可**
- リアルタイム同期：
  - Firestore の `onSnapshot` を使用
  - Last Write Wins を前提とする
- ドラッグ挙動：
  - ドラッグ中はローカル state のみ更新
  - ドラッグ終了時にのみ Firestore に保存

**やらないこと：**
- マウス移動ごとに Firestore に書き込むこと
- CRDT や複雑な同時編集制御
- 不要な抽象化やレイヤー分割

## コーディング方針

- 基本はシンプルな React Hooks（`useState`, `useEffect`）
- Firestore へのアクセスは、使われる箇所の近くに書く
- 「賢さ」よりも「読みやすさ」を優先する
- TypeScript の型は最小限だが明示的に書く

## 将来拡張を見据えた注意点

将来、以下の拡張を行う可能性があります。

- Firebase Authentication の追加
- 複数ボード対応
- Firestore rules / indexes の強化
- CI（GitHub Actions）によるビルド・デプロイ自動化

ただし、このMVPでは **必要最小限のみ実装** し、
拡張は README に記載するに留めます。

設計上は拡張可能性を意識しつつ、
実装はあくまでMVPのスコープに収めてください。
