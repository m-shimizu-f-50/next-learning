# Chapter 6: 並行データフェッチ

## 一言要約
データフェッチが可能な限り並行になるよう設計する。3つのパターン（①データフェッチ単位のコンポーネント分割 ②並行fetch() ③preloadパターン）を状況に応じて使い分ける。

## 用語
[用語集](glossary.md#データフェッチ) 参照（preloadパターン）

## 使い方

### ①データフェッチ単位のコンポーネント分割（まず検討すべきもの）

非同期コンポーネントが**兄弟**（または兄弟の子孫）として配置されていれば並行にレンダリングされる。依存関係がなく参照単位も異なるなら、コンポーネント自体を分割するのが凝集度の観点でもベスト。

```tsx
function Page({ params }) {
  return (
    <>
      <PostBody postId={id} />   {/* 兄弟 → 並行 */}
      <Comments postId={id} />   {/* 兄弟 → 並行 */}
    </>
  );
}
```

### ②並行fetch()

コンポーネント分割できない（参照単位が不可分）場合、`Promise.all()`で複数のfetchをまとめて並行実行する。

```tsx
const [user, posts] = await Promise.all([
  fetch(`.../users/${id}`).then((res) => res.json()),
  fetch(`.../posts/users/${id}`).then((res) => res.json()),
]);
```

### ③preloadパターン

コンポーネント構造上、**親子関係（ネスト）**にせざるを得ない場合はウォーターフォールが発生する。これをRequest Memoizationを利用した`preload`で解消する。

```ts
// fetcher.ts
export const preloadCurrentUser = () => {
  void getCurrentUser(); // awaitしない = fire and forget
};
export async function getCurrentUser() {
  const res = await fetch("https://dummyjson.com/user/me");
  return res.json();
}
```

```tsx
// page.tsx
export default function Page({ params }) {
  preloadCurrentUser(); // 先に通信だけ投げておく
  return (
    <>
      <Product productId={id} />   {/* 内部でgetCurrentUser()を呼ぶ */}
      <Comments productId={id} />  {/* 内部でgetCurrentUser()を呼ぶ */}
    </>
  );
}
```

**重要**: `preload`は「レンダリングの直列性」自体を変えるわけではない（親→子の順番は変わらない）。変わるのは「データフェッチ（通信）の開始タイミング」で、親の処理中に先行して通信を始めておくことで、子がレンダリングされて同じ関数を呼ぶ頃には（Request Memoizationにより）通信がもう進んでいる、という状態を作る。

注意点: 子孫が該当データを参照しなくなったのに`preload`だけ残っていると、無駄なフェッチが発生する。

### トレードオフ
コンポーネント分割を細かくしすぎるとN+1データフェッチが起きうる（Chapter7で詳細）

## 覚えておくべきルール・規約
- 非同期コンポーネントは兄弟なら並行、親子（ネスト）なら直列にレンダリングされる
- まず検討するのは「①コンポーネント分割」。分割できない場合に「②Promise.all」、親子関係が避けられない場合に「③preload」
- `preload`はレンダリング順序ではなく通信の開始タイミングを早めるだけ、という区別を混同しない
- APIレスポンスの形式（オブジェクトか配列か、フィールドの型）は実際に`curl`等で確認してから型を定義する。憶測で書かない
- `res.json()`は`any`を返すため、関数の戻り値型を宣言していても実装との矛盾を`tsc`は検知できない。型注釈があっても実装が型通りかは目視で確認する
- URLの動的パラメータ（`[id]`等）は常に`string`。無理に`number`へ変換しない

## 自分の言葉での説明（ファインマン）
> 先にpreloadを使用してデータフェッチをすることで平行にAPIを叩くことができるため小コンポーネントがレンダリングしてAPIを呼ぶときにはすでに処理が実行されている分早く処理が終わる
> なので先取りのイメージです

（「先取り」という表現でpreloadの本質を的確に捉えられていた）

## 演習
- 課題内容: 投稿とコメントを表示するページを、`PostBody`/`Comments`を兄弟コンポーネントとして実装（パターン①の実践）
- 実装ファイル:
  - `task-app/src/app/posts/[id]/page.tsx`
  - `task-app/src/app/posts/[id]/components/PostBody.tsx`
  - `task-app/src/app/posts/[id]/components/Comments.tsx`
  - `task-app/src/app/posts/[id]/lib/fetcher.ts`（`server-only`・`PostResponse`/`CommentResponse`型・`res.ok`チェック実装済み）
- 結果: `tsc --noEmit`・`npm run dev`ともに成功し、`/posts/1`でタイトルとコメント一覧の表示を確認済み

## つまずきの分析
- `fetchPostComments`が`res.json()`の結果（`{ comments: [...], total, ... }`というオブジェクト）をそのまま返しており、`Comments`側で`comments.map is not a function`が発生。Chapter3の`UserList`と全く同じパターンのミス
  - 教訓: 事前に`curl`等でAPIレスポンスの実際の形を確認する習慣をつける
- `fetchPost`の戻り値型を`Promise<PostResponse>`と宣言しながら、実装では`return data.title;`（文字列）を返していたが、`tsc`はエラーを検知しなかった
  - Q: なぜエラーにならなかった？ → 自分の回答: わからない → 実際: `res.json()`は`Promise<any>`を返すため、`data.title`も`any`型になり、`any`はどんな型への代入も許してしまう。型注釈は`any`が混ざると安全性を保証しない
  - 教訓: 戻り値の型を宣言しただけで安心せず、実装が本当にその型を満たしているか目視で確認する。特に`res.json()`が絡む箇所は要注意
- ページの動的パラメータ`id`（`string`型）を、`fetchPost`/`fetchPostComments`側で誤って`number`型として受け取ろうとし、`tsc --noEmit`で型エラーを検知して修正
  - 教訓: `next dev`は型エラーがあっても起動してしまうことがある。「画面が動く」ことと「型が正しい」ことは別物なので、実装の節目で`tsc --noEmit`を実行する習慣が有効

## 関連章
- Chapter4: データフェッチ コロケーション（コンポーネント分割・データフェッチ層の前提）
- Chapter5: Request Memoization（preloadパターンを支える仕組み）
- Chapter7: N+1とDataLoader（コンポーネント分割のトレードオフ）
