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
- **コロケーション（Colocation）**: コードをできるだけ関連性のある場所に配置すること。データフェッチの文脈では「データを使うコンポーネント自身にfetch処理を書く」ことを指す（[Chapter4](04-data-fetching-colocation.md)）
- **バケツリレー（Props Drilling）**: 親コンポーネントで取得したデータを、使わない中間層も含めて子・孫へpropsとして渡し続ける実装。Pages Routerの`getServerSideProps`等で発生しやすい（[Chapter4](04-data-fetching-colocation.md)）
- **Request Memoization**: 同じレンダリング中に同一URL・同一オプションの`fetch`呼び出しが複数回発生しても、実際のネットワーク通信は1回だけ実行される仕組み。これによりコロケーション（各コンポーネントが独立してfetchすること）と通信効率を両立できる。オプションが1つでも異なると別リクエスト扱いになる点に注意（[Chapter4](04-data-fetching-colocation.md) / [Chapter5](05-request-memoization.md)）
- **データフェッチ層**: 複数コンポーネントで使う可能性のあるデータフェッチ処理を1つの共通関数（ファイル）に分離したもの。Request Memoizationが「オプションのズレ」で効かなくなる事故を防ぐ（[Chapter5](05-request-memoization.md)）
- **server-only**: importするとそのモジュールがClient Componentからimportされた際にビルドエラーになるパッケージ。データフェッチ層など、サーバー専用のコードを誤ってクライアントで使ってしまう事故を防ぐ。無い場合、ビルド・実行時ともにエラーが出ないまま秘匿情報がクライアントバンドルに漏れることがある（[Chapter5](05-request-memoization.md)）
- **preloadパターン**: 親子関係（ネスト）にせざるを得ずウォーターフォールが発生する箇所で、子が使うデータフェッチ関数を親コンポーネントの中で`await`せず`void`で先に呼んでおく（`void getCurrentUser()`）ことで、レンダリングの直列性は保ったまま通信だけ先行して開始させるテクニック。Request Memoizationにより子が同じ関数を呼んだ時に結果を再利用できる（[Chapter6](06-parallel-data-fetching.md)）
- **N+1データフェッチ**: リスト（N件）を取得した後、各要素ごとに追加で1回ずつ個別のリクエストを発生させてしまうアンチパターン。データフェッチをコンポーネント単位に細かく分割しすぎると起きやすい。各要素のURLが異なるためRequest Memoizationも効かない（[Chapter7](07-n-plus-1-dataloader.md)）
- **DataLoader**: GraphQLサーバー等でよく使われる、データアクセスをバッチ処理・キャッシュするライブラリ。短期間に`loader.load(id)`が複数回呼ばれると、idがまとめられて1つのバッチ関数に配列で渡され、通信を1回にまとめられる。バッチ関数は「`keys`と同じ順序・同じ長さの配列を返す」という契約を守る必要がある（[Chapter7](07-n-plus-1-dataloader.md)）
- **React.cache()**: 渡した関数を、同じレンダリング（リクエスト）内で同じ引数なら前回の実行結果を再利用するようにラップする仕組み。DataLoaderのインスタンスをリクエスト単位で分離する（複数ユーザー間のデータ漏洩を防ぐ）ためだけでなく、同一レンダリング内で必ず同じインスタンスを使わせてバッチ処理自体を成立させるためにも必須（[Chapter7](07-n-plus-1-dataloader.md)）
- **Eager Loading / Lazy Loading**: DataLoaderは必要になった時点でバッチ取得するLazy Loadingの一種。対して、最初の1回のリクエストで関連情報を全部取得するのがEager Loading。バックエンドAPIの都合でLazy Loadingが適さない場合に検討するが、偏りすぎるとGod APIになる（[Chapter7](07-n-plus-1-dataloader.md)）
