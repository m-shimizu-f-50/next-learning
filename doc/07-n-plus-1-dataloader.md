# Chapter 7: N+1とDataLoader

## 一言要約
コンポーネント単位の独立性を高めるとN+1データフェッチが発生しやすくなるので、DataLoaderのバッチ処理で解消する（前提: バックエンドAPI側にも一括取得できるエンドポイントが必要）。

## 用語
[用語集](glossary.md#データフェッチ) 参照（N+1データフェッチ / DataLoader / React.cache() / Eager Loading・Lazy Loading）

## 使い方

### N+1が起きる素朴な実装

```tsx
async function PostItem({ post }: { post: Post }) {
  const user = await getUser(post.userId); // 投稿の数だけ呼ばれる = N回
  // ...
}
```

投稿一覧の取得（1回）+ 各投稿の著者取得（N回）= N+1回のリクエスト。

### DataLoaderによる解消

```ts
const getUserLoader = React.cache(
  () => new DataLoader((keys: readonly number[]) => batchGetUser(keys))
);

export async function getUser(id: number) {
  const userLoader = getUserLoader();
  return userLoader.load(id); // 呼び出し側のインターフェースは変わらない
}
```

`load(id)`が短期間に複数回呼ばれると、idがまとめられて`batchGetUser(keys)`に配列で渡され、通信が1回にまとまる。

### なぜReact.cache()が二重に必須なのか
1. **データ漏洩防止**: DataLoaderのインスタンス自体がキャッシュを持つため、複数ユーザーのリクエストを跨いで使い回すと、あるユーザーのデータが別ユーザーに漏れる
2. **バッチ処理の成立自体に必須**: `React.cache()`が無いと`getUserLoader()`が呼ばれるたびに`new DataLoader(...)`が実行され、呼び出し元の数だけ別々のインスタンスができてしまう。各インスタンスは`load()`が1回しか呼ばれないため、バッチにまとめる相手がおらず、結局N回の個別リクエストに戻ってしまう（DataLoaderを導入した意味が消える）

### トレードオフ: Eager Loadingパターン
DataLoaderはLazy Loadingの一種。バックエンドAPI側の都合でLazy Loadingが適さない場合、最初の1回のリクエストで関連情報を全部取得するEager Loadingを検討する。ただし偏りすぎるとGod APIになる（Chapter3・Chapter8参照）。

## 覚えておくべきルール・規約
- コンポーネント分割を進めるほどN+1が起きやすくなる。Request Memoizationは「同一URL」の重複しか防げず、要素ごとにURLが異なるN+1には効かない
- DataLoaderのバッチ関数は「`keys`と同じ順序・同じ長さの配列を返す」契約を守る（`keys.map((key) => data.find(...))`のパターン）
- `React.cache()`はデータ漏洩防止だけでなく、バッチ処理そのものを成立させるためにも必須
- 「全件取得」でバッチの代わりにする場合、APIのデフォルトのページネーション（`limit`等）を必ず確認する。取得件数を過信しない
- `find()`で見つからない可能性がある場合、`!`（non-null assertion）で型上は握りつぶせるが、実際に見つからないと`undefined`のまま後続処理に渡り、離れた場所で`Cannot read properties of undefined`として顕在化する。原因調査では「ログの実行回数」と「実際のデータ件数」を照らし合わせるのが有効

## 自分の言葉での説明（ファインマン）
> （React.cache()が無い場合の挙動について）インスタンスは3つでload()は1回になる？
>
> → 訂正を経て: インスタンスが3つに分かれ、各インスタンスでload()が1回ずつ呼ばれる。バッチにまとめる相手がいないため、結局3回の個別リクエストになる、という理解に到達

## 演習
- 課題内容: 投稿一覧ページに、各投稿の著者情報を表示する`PostItem`を実装。まずDataLoaderなし（N+1発生）で確認し、その後DataLoaderを導入して1回のリクエストに削減する
- 実装ファイル:
  - `task-app/src/app/posts/page.tsx`
  - `task-app/src/app/posts/components/PostItem.tsx`
  - `task-app/src/app/posts/lib/fetcher.ts`（`fetchPosts`・`batchGetUser`・`getUserLoader`・`fetchUser`）
- 結果:
  - DataLoader導入前: ログで投稿数分（N回）の`API実行`を確認
  - DataLoader導入後: ログで`API実行`が1回にまとまったことを確認（`keys`に全IDがまとめて渡された）

## つまずきの分析
- `PostItem`でJSXを`return`し忘れ、`Promise<void>`型になり「JSXコンポーネントとして使用できない」エラーが発生
  - 教訓: 非同期コンポーネントでも`return`は必須。式文として書いただけでは返らない
- `page.tsx`で`<PostItem userId={post.id} />`と、投稿IDを誤ってユーザーIDとして渡していた（`PostResponse`型に`userId`フィールドが無かったのが原因）
  - 教訓: 型定義の不足が、実行時エラーにならない「意味的なバグ」を誘発することがある。API仕様と型定義を都度突き合わせる
- `batchGetUser`が`https://dummyjson.com/users`（デフォルトで30件、全体は208件）から`find`していたため、`userId`が31以降のユーザーが見つからず`undefined`になり、`Cannot read properties of undefined (reading 'firstName')`が発生
  - 教訓: 「全件取得」という設計判断をする際は、APIのデフォルトのページネーション/limitを必ず確認する。`limit=0`で全件取得できることを確認して解決
  - 調査の手がかり: ログに`API実行`が1回しか出ていない（バッチ化は成功）のに一部だけエラーになる、という状態から「取得したデータの件数不足」を疑えた

## 関連章
- Chapter6: 並行データフェッチ（コンポーネント分割の延長線上でN+1が発生する）
- Chapter8: 細粒度のREST API設計（Eager Loadingが偏った場合のGod API化の詳細）
