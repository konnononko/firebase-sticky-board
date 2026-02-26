# Copilot Instructions for firebase-sticky-board

このリポジトリは、  
Firebase を使った付箋ホワイトボードWebアプリ です。

MVP フェーズを完了し、現在は **プロダクトとして日常利用できる状態に拡張するフェーズ（dev-steps04）** にあります。

目的：
- シンプルな設計を維持しながらプロダクト品質を上げる
- 読みやすく認知負荷の低いコードを書く
- 小さなステップで安全に拡張する
- 実務プロダクトとして通用する品質を目指す
- 過剰設計や先回り実装を避ける

開発は `docs/dev-steps*.md` に従って進めます。  
`copilot-instructions.md` や `README.md` への方針・知見の反映が適切な場面では、更新内容を提案してください。

## アーキテクチャ概要

- React + TypeScript（Vite）
- Firebase Cloud Firestore（永続化・リアルタイム同期）
- Firebase Hosting（デプロイ）
- Firebase Authentication（認証）
- Firebase Security Rules（権限）
- Tailwind CSS
- shadcn/ui

Firestore 構成：
- `boards/{boardId}`
- `boards/{boardId}/notes/{noteId}`

ルーティング：
- `/` : Top画面（ログイン・ボード作成・ボード一覧）
- `/b/:boardId` : ボード閲覧・編集

## コアの制約

付箋編集モデル：
- 空の付箋を追加できる
- 作成後にテキスト編集できる
- クリックで編集開始
- 編集終了（blur）で保存する
- 編集中はドラッグしない
- 編集中の文字はローカル state に保持し、保存時にのみ Firestore に書き込む

リアルタイム同期：
- Firestore の `onSnapshot` を使用
- Last Write Wins を前提とする
- CRDT は導入しない

ドラッグ挙動：
- ドラッグ中はローカル state のみ更新
- ドラッグ終了時にのみ Firestore に保存
- マウス移動ごとに Firestore に書き込まない

共有モデル：
- 共有リンク方式（boardId を URL に含める）
- 「リンクを知っている人は編集できる」
- 招待管理（メンバー一覧、権限付与 UI）は実装しない

認証モデル：
- 参加者：匿名ログインで可
- オーナー（ボード作成者）：非匿名ログイン必須
- UI 側の制御だけでなく、Security Rules 側でも制約を保証する

## 実装方針

重要：
- シンプルさを優先する
- 読みやすさを優先する
- 過剰抽象化しない

React方針
- 基本は React Hooks を使う
  - useState
  - useEffect
  - useRef
- 状態管理ライブラリは導入しない。

Firestore方針
- Firestoreアクセスは使用箇所の近くに書く
  - 例: `collection(db, "boards", boardId, "notes")`
- ただし以下の場合は分割を許容する：
  - 同じロジックが複数箇所に出る
  - boardId の取り回しが複雑になる
  - 例: `getNotesCollectionRef(boardId)`

コンポーネント分割方針
- 原則
  - シンプルな構成を維持する
- ただし以下の場合は分割を許容する：
  - Board.tsx が大きくなった場合
  - StickyNote UI が独立した責務を持つ場合
  - 編集ロジックが増えた場合
- 過度なレイヤー分割は行わない。

TypeScript方針
- 型は明示的に書く
- 過度に複雑な型は使わない

## やらないこと

- CRDTや高度な同時編集制御
- ReduxやZustandなどの状態管理導入
- 不要な抽象化
- Repository層の導入
- 早すぎる最適化
- 大規模リファクタリング

## 将来拡張の方向性（参考）

ただし今は実装しない：
- 招待制共有
- 権限管理
- App Check
- スパム対策強化
- EmulatorによるRulesテスト
- CI導入

必要になった段階で検討する。

## 開発スタイル

- 小さな変更を積み重ねる
- 動く状態を保つ
- dev-steps に従って進める
- 既存の挙動を壊さない
- 1日30分から1時間の作業で、1週間から2週間でひとまとまりのフェーズを終えるペース

設計上は拡張可能性を意識しつつ、実装は現在の dev-steps のスコープに収めること。
