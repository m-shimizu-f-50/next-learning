# 用語集

学習中に出てきた用語をまとめる。新しい章で新しい用語が出てきたら随時追記する。
各用語には初出のChapterをリンクしておく。

## Router / アーキテクチャ

- **App Router**: Next.jsの現行の主流Router。`app/`ディレクトリを使い、React Server Componentsをはじめとする先進機能をサポートする（[Chapter1](01-intro.md)）
- **Pages Router**: Next.jsの従来のRouter。`pages/`ディレクトリを使う。コンポーネントは基本すべてクライアントコンポーネント相当で、データ取得は`getServerSideProps`等の専用関数で行う（[Chapter1](01-intro.md)）
- **RSC（React Server Components）**: Reactが提供する新しいコンポーネントモデル。「サーバーでのみ実行されるコンポーネント（Server Components）」と「ブラウザでも実行されるコンポーネント（Client Components）」を明確に区別できるようにする仕組み全体を指す。App RouterはこのRSCを土台にして作られている（[Chapter1](01-intro.md)）
  - 主な目的は3つ
    1. **JSバンドルサイズの削減**: Server ComponentsのコードはブラウザにJSとして送られない
    2. **データアクセスの安全性**: DB接続情報やAPIキーなどの秘匿情報をサーバー内に閉じ込められる（クライアントに漏れない）
    3. **サーバーリソースへの直接アクセス**: コンポーネントの中から直接DBやファイルシステムにアクセスできる
  - Server Components / Client Componentsという2つのコンポーネント種別は、RSCという仕組みが提供する概念

## コンポーネント

- **Server Components**: サーバーでのみ実行されるコンポーネント。コード自体がブラウザに送られないため、ハイドレーションが発生しない（JSバンドル削減）。App Routerのデフォルト（[Chapter1](01-intro.md)）
- **Client Components**: `'use client'`で宣言するコンポーネント。サーバーで初回HTMLを生成した後、ブラウザにもJSが送られてハイドレーションされ、インタラクティブになる（[Chapter1](01-intro.md)）
- **インタラクティブ**: ユーザーの操作（クリック・入力等）に応じてブラウザ上でリアルタイムに画面が反応・変化すること。実現にはブラウザ側でJSが動いている必要がある（[Chapter1](01-intro.md)）

## レンダリング

- **ハイドレーション（Hydration）**: サーバーが生成した静的HTMLに対し、同じコンポーネントのJSをブラウザで実行してイベントリスナー等を紐付け、インタラクティブにする処理。Client Componentsのみで発生し、Server Componentsでは発生しない（[Chapter1](01-intro.md)）
- **SSR（Server-Side Rendering）**: リクエストごとにサーバー側でHTMLを生成する方式。「いつ・どこでHTMLを作るか」というレンダリングのタイミング軸の話で、Server/Client Componentsの軸とは別物（[Chapter1](01-intro.md)）
- **SSG（Static Site Generation）**: ビルド時にHTMLを静的生成する方式（[Chapter1](01-intro.md)）
- **CSR（Client-Side Rendering）**: ブラウザ側でHTMLを構成・表示する方式（[Chapter1](01-intro.md)）

## データフェッチ

- **バックエンドAPI分離アプローチ**: Next.js側でDBに直接アクセスせず、別に立てたバックエンドAPIを叩いてデータ取得する構成。本書はこちらを前提に解説する（対比: DB統合アプローチ）（[Chapter2](02-part1-data-fetching.md)）
- **God API**: 1つのAPIエンドポイントが多くの用途・画面のデータをまとめて返す、責務が肥大化したAPI。通信回数を減らせる一方、変更容易性が下がりやすい（[Chapter3](03-server-components-data-fetching.md)）
- **Chatty API（おしゃべりなAPI）**: 責務が小さく細粒度に分かれたAPI。コロケーション・カプセル化しやすい一方、通信回数が増えやすく、ウォーターフォールが起きやすい（[Chapter3](03-server-components-data-fetching.md)）
- **3rd partyライブラリ**: 自社コードではなく外部が公開しているパッケージ。クライアントサイドのデータフェッチ文脈ではSWR/React Query/Apollo Client/Relay/tRPC等を指す。学習コスト・バンドルサイズ増加の要因になる（[Chapter3](03-server-components-data-fetching.md)）
- **Server Functions**: `"use server"`でマークし、クライアントサイドから呼び出せるようにしたサーバー関数。「Server Componentsには`"use server"`が必要」は誤解で、`"use server"`はServer Functions用のマーク（詳細はChapter11）（[Chapter3](03-server-components-data-fetching.md)）
- **RSC Payload**: Server Componentsの実行結果としてクライアントに送られるデータ形式（HTMLとは別に、Reactがハイドレーションや差分更新に使う）（[Chapter3](03-server-components-data-fetching.md)）
