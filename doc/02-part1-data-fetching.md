# Chapter 2: 第1部 データフェッチ（概要）

> 部: 第1部 データフェッチ
> 元記事: https://zenn.dev/akfm/books/nextjs-basic-principle/viewer/part_1
> 学習日: 2026-08-28

## 一言要約
RSCはデータフェッチにおいてもパラダイムシフトを要求する。Server Componentsによってセキュア・シンプルな実装が可能になる一方、従来と異なる設計思想が必要。本書はバックエンドAPIを分離するアプローチを前提に解説する。

## 解決したい課題
- Before: 従来のReactフレームワークのデータフェッチの発想のままApp Routerを使うと、設計思想のズレで混乱する
- After: RSC前提のデータフェッチの考え方を第1部で身につける

## コア概念
- RSCはデータフェッチにおいて従来のReactフレームワークからの**パラダイムシフト**を要求する
- Server Componentsにより、データフェッチが「セキュア」かつ「シンプル」になる（詳細な理由はChapter3以降）

### Next.jsの2つのデータアクセスパターン

「Next.jsからどうやってデータを取ってくるか」には、大きく分けて2通りの構成がある。

**パターンA: バックエンドAPIを分離する（本書はこちらを前提）**
```
[Next.js (Server Components)] --fetch()--> [別サーバーのAPI (REST/GraphQL)] --> [DB]
```
- Next.jsは「外部のAPIを叩くだけ」。DBのスキーマや中身は一切知らない
- 既にバックエンドチーム/APIがある場合や、モバイルアプリなど他のクライアントともAPIを共有したい場合に使われやすい構成

**パターンB: Next.jsにDBアクセスを統合する**
```
[Next.js (Server Components)] --Prismaなど--> [DB]
```
- Next.jsの中（Server Components/Server Actions）から直接DBを操作する
- バックエンドを別に立てず、Next.js単体でフルスタックにする構成

### なぜ本書はパターンAを前提にするのか

理由は「**Server Componentsの中で`await`してデータを取ってくる」という書き方の形自体は、どちらのパターンでも同じだから**。

```tsx
// パターンA: 外部APIをfetch
async function Page() {
  const data = await fetch('https://api.example.com/posts').then(r => r.json())
  // ...
}

// パターンB: DBに直接アクセス（例: Prisma）
async function Page() {
  const data = await db.post.findMany()
  // ...
}
```

呼び先が「外部API」か「DB」かが違うだけで、コンポーネントの中で非同期にデータを取得して使う、という「考え方」のレベルでは差がない。だから本書は、より汎用的でイメージしやすい「外部APIをfetchする」パターンAに統一して説明していく。

## 最小コード例
```tsx
// Server Componentsの中でawaitしてデータを取得する、という共通の形
async function Page() {
  const data = await fetch('https://api.example.com/posts').then(r => r.json())
  return <ul>{data.map((post) => <li key={post.id}>{post.title}</li>)}</ul>
}
```

## 自分の言葉での説明（ファインマン）
（この章はごく短い前置きのため省略。実質的な理解確認はChapter1の復習チェックで実施）

## つまずいたポイント・Q&A
- Q: パターンA（バックエンドAPI分離）とパターンB（DB統合）で、コンポーネントの書き方（`await`の使い方）は何が同じで何が違うか？
  → 自分の回答: 思い出せず
  → 実際の答え: 「Server Componentsの中で`await`してデータを取得する」という書き方の形は同じ。違うのは`await`する呼び先（外部APIかDBか）だけ。だから本書はより汎用的な「外部APIをfetchする」パターンAに統一している

## 復習履歴
| 日付 | 結果 | メモ |
|---|---|---|
| 2026-08-28 | 正解（Chapter1の復習として実施） | 「ハイドレーションされない理由」を正しく説明できた。ただし「JSを作成しない」→「JSを送らない」と言葉の精度を補足 |
| 2026-08-31 | 不正解（2回とも思い出せず） | パターンA/Bの違いを「呼び先の違いだけで書き方の形は同じ」と再解説。ドキュメントに図とコード比較を追加してブラッシュアップ済み |

## 関連章
- Chapter3: データフェッチ on Server Components（「セキュア・シンプル」の具体的な理由）
