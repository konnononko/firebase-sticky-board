# firebase-sticky-board

A minimal realtime sticky-note whiteboard built with Firebase.

Firebase（Firestore + Hosting）を使った、  
付箋を貼って動かせるホワイトボードWebアプリです。

「最短で動くクラウドアプリを作る」ことを目的に、  
リアルタイム同期・ドラッグ操作にフォーカスしています。

## Status

- MVP: Done (deployed)
- Current focus: Phase 2 (sharing + auth + rules)

開発手順は `docs/dev-steps.md`（MVP）と `docs/dev-steps02.md`（次フェーズ）を参照してください。

## Features (MVP)

- 付箋の作成（作成時のみテキスト入力）
- 付箋のドラッグ移動
- リアルタイム同期（Firestore onSnapshot）
- シングルボード構成（boardId固定）
- Firebase Hosting で公開

※ 付箋のテキストは作成後は編集不可です。

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

## Design Decisions

- ドラッグ中はローカル state のみ更新
  - ドロップ時に Firestore へ反映
  - 書き込み回数と遅延を抑制
- Last Write Wins を前提としたシンプルな同期
- CRDT / ロック等は導入せず、MVPとして割り切り

## Phase 2 Roadmap (planned)

次フェーズでは、MVPを壊さずに以下を追加します。

- 付箋削除
- 付箋の色変更
- 共有リンク方式（`/b/:boardId`）で共同編集
- 認証
  - 参加者: 匿名ログイン
  - オーナー（ボード作成）: 非匿名ログイン（Google 等）必須
- Firestore Security Rules の導入（最低限の権限制御）

## Local Development

```bash
pnpm install
pnpm dev
```

Firebase Emulator は将来導入予定。

## Deployment

```bash
pnpm build
firebase deploy
```

## Possible Extensions

このプロジェクトは、以下の拡張を前提に設計しています。

- 共有の強度を上げる（トークン方式 / 招待方式）
- 認証の追加（Google / GitHub、匿名からの昇格）
- ボード一覧、メンバー管理
- Firestore rules / indexes の強化
- App Check、簡易的なスパム対策
- CI（GitHub Actions）による build / deploy 自動化

## Scope

このリポジトリは「最短で動くクラウドMVP」から段階的に拡張することを目的としており、
高度な同時編集（CRDT 等）は扱いません。
