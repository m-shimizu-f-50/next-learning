# Chapter 1: はじめに

> 部: 導入
> 元記事: https://zenn.dev/akfm/books/nextjs-basic-principle/viewer/intro
> 学習日: 2026-08-27

## 一言要約
Next.jsにはApp RouterとPages Routerの2つがあり、本書はApp Router/React Server Components（RSC）の根底にある「考え方」を扱う（機能紹介ではなく設計思想の本）。前提はNext.js v15、「Next.js」と書けば基本App Router。

## 解決したい課題
- Before: App RouterとPages Routerの機能差は知っていても、「なぜそう設計されているか」が分からないまま実装している
- After: RSCベースの設計思想を理解し、実装の判断に迷わなくなる

## コア概念

- **App Router / Pages Routerの違い**
  | 観点 | Pages Router | App Router |
  |---|---|---|
  | ディレクトリ | `pages/` | `app/` |
  | コンポーネントの実行場所 | 基本すべてクライアントコンポーネント相当 | デフォルトが**Server Components** |
  | データ取得 | `getServerSideProps`等の専用関数 | コンポーネント内で直接`async/await` |
  | レンダリング方式 | SSR/SSG/CSR/ISRを選べる（Pages Router＝SSRではない） | 同様に複数方式あり |

- **Server Components / Client Components**（App Routerで新登場）
  - Server Components: サーバーでのみ実行。コード自体がブラウザに一切送られない
  - Client Components: サーバーで初回HTML生成 → ブラウザにJSも送られる → **ハイドレーション**されてインタラクティブになる

- **SSR/CSRとServer/Client Componentsは別の軸**
  - SSR/SSG/CSR = **いつ・どこでHTMLを作るか**（レンダリングのタイミング軸）
  - Server/Client Components = **そのコードがJSとしてブラウザに送られるか**（バンドル境界軸）
  - Client Componentは「サーバーでHTML生成 → ブラウザでハイドレーション」の2段階を経る。CSR単体ではない

- **ハイドレーションはClient Componentにしか起きない**
  - ハイドレーション＝サーバーが作ったHTMLに対し、同じコンポーネントのJSをブラウザで実行してイベントリスナー等を紐付ける処理
  - Server ComponentsはJSがブラウザに届かないので、ハイドレーションという工程自体が存在しない → これがJSバンドル削減の理由

- **なぜ全部Server Componentsにできないか**
  - `useState`/`useReducer`（状態と再レンダー）、`onClick`等のイベントハンドラ、`useEffect`、`window`/`localStorage`などブラウザAPIは、ブラウザでJSが実行され続けることが前提
  - Server Componentsは1回実行して終わりなので、これらは扱えない
  - → 基本はServer Components、インタラクティブが必要な葉の部分だけClient Components、という設計になる（詳細はChapter12）

## 自分の言葉での説明（ファインマン）
> AppRouterはフォルダベースのルーティングであり、フォルダ構成によって自動的にルーティングが構築される。レイアウトの実装が簡単のため各ページごと異なるレイアウトを設定するのが簡単。サーバーコンポーネントのデフォルトで入っている

> ハイドレーションというのもサーバーコンポーネントはサーバーHTMLを生成してJSは送らないので、これはない作りになっているのがサーバーコンポーネントで、クライアントコンポーネントはサーバーでHTML生成してブラウザにもJSが送られるので、そこでハイドレーションされることによってインタラクティブになるという工程が生まれます。サーバーコンポーネントの方は、ブラウザにJSを送る必要がなくなるため、バンドルサイズを削減できるというところがメリットになります。

## つまずいたポイント・Q&A
- Q: インタラクティブとは？ → ユーザー操作に応じてブラウザ上でリアルタイムに画面が反応・変化すること（クリック・入力等 → JSが必要）
- Q: サーバーコンポーネントのハイドレーションはいつ行われる？ → 行われない。ハイドレーション対象のJSがブラウザに存在しないため、そもそも工程自体が発生しない
- Q: 全部サーバーコンポーネントで実装した方がいいのでは？ → 状態管理・イベントハンドラ・ブラウザAPIなど「ブラウザで動き続ける必要があるもの」はServer Componentsでは扱えないため不可能。詳細はChapter12で扱う

## 復習履歴
| 日付 | 結果 | メモ |
|---|---|---|

## 関連章
- Chapter11: クライアントとサーバーのバンドル境界（Server/Client Componentsの境界を深掘り）
- Chapter12: Client Componentsのユースケース（「全部Server Componentsにできない理由」の具体化）
