# Chapter 5: Request Memoization

## 一言要約
データフェッチ層を分離して、Request Memoizationを活かせる設計を心がける。分離した層は`server-only`で保護し、誤ってクライアントから使われることを防ぐ。

## 用語
[用語集](glossary.md#データフェッチ) 参照（Request Memoization / データフェッチ層 / server-only）

## 使い方

### Request Memoizationの制約

Next.jsがリクエストを「重複」と判定するには**同一URL・同一オプション**である必要がある。オプションが1つでも異なれば別リクエストとして扱われ、メモ化が効かない。

```ts
// これは同じリクエストとしてメモ化される
fetch("https://dummyjson.com/users/1");
fetch("https://dummyjson.com/users/1");

// オプションが違うと別リクエスト扱いになり、メモ化が効かない
fetch("https://dummyjson.com/users/1");
fetch("https://dummyjson.com/users/1", { cache: "no-store" });
```

### データフェッチ層への分離

オプションの指定ミスでメモ化が効かなくなる事故を防ぐため、複数コンポーネントで使う可能性のあるフェッチ処理は共通関数（データフェッチ層）に分離する。

```ts
// app/products/fetcher.ts
export async function getProduct(id: string) {
  const res = await fetch(`https://dummyjson.com/products/${id}`, {
    // 独自ヘッダーなど
  });
  return res.json();
}
```

ファイル分離もコロケーションを意識し、規模に応じて`fetcher.ts` → `_lib/fetcher.ts` → `_lib/fetcher/product.ts`と細分化する。

### server-onlyによる保護

```ts
import "server-only";

export async function getProduct(id: string) {
  // ...
}
```

`server-only`が無い場合、誤ってClient Componentからimportされてもビルドは通ってしまう。実行時にエラーになるとは限らず、**秘匿情報がエラーも出ないままクライアントバンドルに漏れる**ことがある（一番怖いパターン）。`server-only`は、このミスをビルド時点で強制的に検知させるための仕組み。

## 覚えておくべきルール・規約
- Request Memoizationは「同一URL・同一オプション」の`fetch`にしか効かない。オプション違いは別リクエスト扱いになる
- 複数コンポーネントから使う可能性のあるフェッチ処理は、必ず共通のデータフェッチ層（関数）に分離する
- データフェッチ層のファイルには`server-only`を先頭でimportする
- `server-only`が無くてもビルド・実行が成功することがある点に注意（エラーで気づけるとは限らない）

## 自分の言葉での説明（ファインマン）
> オプション等でも違う書き方をしていた場合Request Memoizationは別物と判断してしまいリクエストしてしまうため、Request Memoizationを効かせたい場合は共通関数としてファイルを分離させて使用することによって効かせたいのに効かないといったことがなくなる

（Request Memoizationの制約とデータフェッチ層の役割を正確に説明できていた）

## 演習
- 課題内容: `task-app/src/app/user-profile/lib/fetchUser.ts`に`server-only`を追加する
- 実装ファイル: `task-app/src/app/user-profile/lib/fetchUser.ts`
- 結果: `import 'server-only';`を追加し、`npm run dev`で今まで通り動作することを本人が確認済み

## つまずきの分析
- Q: `server-only`をimportしていない場合、何が起きる？
  → 自分の回答: 実行時エラーになるのではと予想
  → 実際: ビルド・実行ともにエラーが出ないことがある。fetch先がプライベートAPIならネットワークエラーになるが、秘匿情報をヘッダーに埋め込んでいた場合はエラーすら出ずクライアントバンドルに漏れる。「エラーで気づける」とは限らない点が`server-only`の存在意義
- 教訓: 「エラーになるはず」という思い込みは危険。フレームワークが明示的に守ってくれる仕組み（`server-only`）が無い箇所は、静かに壊れる可能性がある

## 関連章
- Chapter4: データフェッチ コロケーション（本章の前提）
- Chapter9: ユーザー操作とデータフェッチ（ボタン操作などインタラクティブな起点でのデータフェッチ・Server Actions）
- Chapter11: クライアントとサーバーのバンドル境界（`server-only`を含むバンドル境界の詳細）
