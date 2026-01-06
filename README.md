# firebase-sticky-board

A minimal realtime sticky-note whiteboard built with Firebase.

Firebase（Firestore + Hosting）を使った、  
**付箋を貼って動かせるホワイトボードWebアプリのMVP** です。

「最短で動くクラウドアプリを作る」ことを目的に、  
リアルタイム同期・ドラッグ操作にフォーカスしています。

## Features (MVP)

- 付箋の作成（作成時のみテキスト入力）
- 付箋のドラッグ移動
- リアルタイム同期（Firestore onSnapshot）
- シングルボード構成（boardId固定）
- Firebase Hosting で公開

※ 付箋のテキストは **作成後は編集不可** です。

## Tech Stack

- Frontend: React + TypeScript (Vite)
- Backend / BaaS: Firebase
  - Cloud Firestore
  - Firebase Hosting
- Realtime sync: Firestore subscriptions

## Data Model (simplified)

```
boards/{boardId}
└─ notes/{noteId}
- text: string
- x: number
- y: number
- createdAt
- updatedAt
```

## Design Decisions (MVP)

- **ドラッグ中はローカル state のみ更新**
  - ドロップ時に Firestore へ反映
  - 書き込み回数と遅延を抑制
- **Last Write Wins** を前提としたシンプルな同期
- CRDT / ロック等は導入せず、MVPとして割り切り

## Local Development

```bash
npm install
npm run dev
```

Firebase Emulator は将来導入予定。

## Deployment

```bash
npm run build
firebase deploy
```

## Possible Extensions

このMVPは、以下の拡張を前提に設計しています。

- Firebase Authentication（Google / GitHub / 匿名）
- 複数ボード対応（`/b/:boardId`）
- 付箋の権限管理（owner / members）
- テキスト編集機能（確定時のみ保存）
- Firestore rules / indexes の強化
- CI（GitHub Actions）による build / deploy 自動化

## Scope

このリポジトリは **「最短で動くクラウドMVP」** を目的としており、
高度な同時編集（CRDT 等）は扱いません。
