# Chapter 4: データフェッチ コロケーション

## 一言要約
データフェッチはデータを使うコンポーネント自身に書く（コロケーション）べき。これによりPages Routerで起きがちだったバケツリレー（Props Drilling）が解消され、コンポーネントの独立性が高まる。重複フェッチの懸念はRequest Memoizationが解決する。

## 用語
[用語集](glossary.md#データフェッチ) 参照（コロケーション / バケツリレー（Props Drilling） / Request Memoization）

## 使い方

### Pages Routerのバケツリレー問題

`getServerSideProps`などページコンポーネントの外側でデータを取得し、`props`として親→子→孫…と渡す必要があった。

```tsx
export const getServerSideProps = async () => {
  const res = await fetch("https://dummyjson.com/products/1");
  const product = await res.json();
  return { props: { product } };
};

export default function ProductPage({ product }) {
  return <ProductContents product={product} />; // 使わない中間層にも渡す
}

function ProductContents({ product }) {
  return (
    <>
      <ProductHeader product={product} />
      <ProductDetail product={product} />
    </>
  );
}
```

問題点: 冗長、依存関係が広がりやすい、常に「ページ」という単位を意識させられる（コンポーネント指向との相性が悪い）

### App Router: 末端コンポーネントへのコロケーション

Server Componentsを使い、データを実際に使うコンポーネント自身が自分でfetchする。

```tsx
export default function ProductPage() {
  return (
    <>
      <ProductHeader />
      <ProductDetail />
    </>
  );
}

async function ProductHeader() {
  const product = await fetchProduct();
  return <>...</>;
}

async function ProductDetail() {
  const product = await fetchProduct();
  return <>...</>;
}

async function fetchProduct() {
  const res = await fetch("https://dummyjson.com/products/1");
  return res.json();
}
```

`ProductHeader`と`ProductDetail`が両方`fetchProduct()`を呼んでいるが、Request Memoizationにより実際の通信は1回のみ。

## 覚えておくべきルール・規約
- データフェッチは末端のコンポーネント自身で行う（ページコンポーネントに集約しない）
- 小規模な実装ならページコンポーネントでフェッチしても問題ない。実装が肥大化するほど末端でのコロケーションを推奨
- 複数コンポーネントが同じデータをfetchしても、Request Memoizationにより実際の通信は1回で済む（重複フェッチを気にして無理に1箇所へ集約しなくてよい）
- JSXを含まない純粋なTS/JSファイル（型定義やユーティリティ関数のみ）は`.ts`拡張子を使う。`.tsx`はJSX構文を含む場合のみ

## 自分の言葉での説明（ファインマン）
> AppRouterはServerComponentsを使える影響でデータを実際に使うコンポーネント自身でfetchする構成にできるためそちらを使用したほうがPageRouterでやっていたバケツリレーでデータを受け渡す方法でしなくて済むのがあります。また、同じAPIを読んだとしてもデータをメモ化して同じデータを返してくれるためAPIを一度呼べば済むためAppRouterの方が保守性であったり、可読性から見ても推奨されるのかなと思いました。

（Pages Routerとの違い・Request Memoizationの役割の両方を正確に説明できていた）

## 演習
- 課題内容: `https://dummyjson.com/users/1` からユーザー情報を取得し、`UserProfileHeader`（名前表示）と`UserProfileDetail`（email表示）がそれぞれ独立して共通の`fetchUser()`を呼ぶ構成を実装
- 実装ファイル:
  - `task-app/src/app/user-profile/page.tsx`（親、propsなし）
  - `task-app/src/app/user-profile/components/UserProfileHeader.tsx`
  - `task-app/src/app/user-profile/components/UserProfileDetail.tsx`
  - `task-app/src/app/user-profile/lib/fetchUser.ts`（共通の`User`型・`fetchUser()`、`res.ok`チェックも実装済み）
- 結果: `npm run dev`で起動し、`/user-profile`で名前・emailの表示を本人が動作確認済み

## つまずきの分析
- `fetchUser.tsx`として作成していたが、JSXを含まない純粋なTypeScriptファイルなので`.ts`が適切という指摘を受け、`fetchUser.ts`にリネーム
- 概念面の大きなつまずきは無し。Pages Routerとの違い、Request Memoizationの役割ともに一度で正確に説明できた
- 教訓: ファイル拡張子（`.ts` / `.tsx`）はJSXの有無で機械的に決まる。中身を書く前に「このファイルはJSXを返すか」で判断する

## 関連章
- Chapter3: データフェッチ on Server Components（コロケーションの前提となるServer Componentsでのfetch）
- Chapter5: Request Memoization（コロケーションを支える仕組みの詳細）
