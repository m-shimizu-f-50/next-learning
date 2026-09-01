# Chapter 3: データフェッチ on Server Components

## 一言要約
データフェッチはClient ComponentsではなくServer Componentsで行うべき。クライアントサイドのデータフェッチには3つの問題（パフォーマンスと設計のトレードオフ／実装コスト／バンドルサイズ増加）があり、Server Componentsはそれぞれを解決する。

## 用語
この章の新出用語は [用語集](glossary.md#データフェッチ) を参照（God API / Chatty API / 3rd partyライブラリ / Server Functions / RSC Payload）

## 使い方

### なぜクライアントサイドのデータフェッチは問題なのか

| 問題 | 内容 |
|---|---|
| ①パフォーマンスと設計のトレードオフ | クライアント⇄サーバー通信は低速・不安定になりがち。通信回数を減らすとGod API、細粒度にするとChatty APIになりやすい |
| ②様々な実装コスト | キャッシュ機能付き3rd partyライブラリの学習コスト、APIを公開する分のセキュリティ対策コストが発生 |
| ③バンドルサイズの増加 | 3rd partyライブラリ・フェッチ処理・バリデーション・エラー時UIのコードまで全部クライアントに送られる |

### なぜServer Componentsが解決するのか

| メリット | 内容 |
|---|---|
| ①高速なバックエンドアクセス | Next.jsサーバー⇄APIサーバー間は同一ネットワーク等で高速・安定なことが多い |
| ②シンプルでセキュアな実装 | 非同期関数をそのままサポート、3rd partyライブラリ不要。APIをパブリックに公開する必要もなくなる |
| ③バンドルサイズの軽減 | クライアントにはHTML/RSC Payloadだけが送られ、フェッチ・バリデーション等のコードは一切バンドルされない |

```tsx
export async function ProductTitle({ id }) {
  const res = await fetch(`https://dummyjson.com/products/${id}`);
  const product = await res.json();
  return <div>{product.title}</div>;
}
```

### トレードオフ
1. **ユーザー操作とデータフェッチ**: ユーザー操作起点のデータフェッチはServer Componentsだと難しい場合がある（詳細はChapter9）
2. **GraphQLとの相性の悪さ**: RSCとGraphQLは同じ問題（パフォーマンスと設計のトレードオフ）を別々に解決しようとするアーキテクチャなので、組み合わせても相乗効果がなく、知見不足で実装コスト増・バンドルサイズ増になりやすい

## 覚えておくべきルール・規約
- データフェッチは基本Server Componentsで行う（Client Componentsで行わない）
- 「Server Componentsには`"use server"`が必要」は誤解。`"use server"`はServer Functions（クライアントから呼べる関数）専用のマークで、Server Components自体には不要
- `page.tsx`は`export default`が必須。named exportではNext.jsはページとして認識しない（App Router共通の規約）
- `res.json()`の戻り値は`any`型なので、型注釈（`: User[]`など）を書いても実際のデータ構造とズレていてもコンパイルエラーにならない。実際のレスポンス形式は必ず確認する

## 自分の言葉での説明（ファインマン）
> God APIは一回のAPI通信で欲しいデータを全て取得できるAPIを指しており、一回で取得できる分、他の画面とかで流用しにくい
>
> Chatty APIは一つ一つのAPIが細かくなっているAPI。責務が小さい。各コンポーネントで自分が必要な値を取得でいるようにAPIの再利用がしやすい。細かく分けている分APIの通信回数が多くなりがちになってしまう

（Chatty APIの説明は責務・再利用性・通信回数の3点を正確に捉えられていた。God APIは「変更容易性の低下」という観点の補足が必要だった）

## 演習
- 課題内容: `https://dummyjson.com/users` からユーザー一覧を取得し、名前を`<ul>`でリスト表示するServer Component（`UserList`）を実装
- 実装ファイル: `task-app/src/app/user-list/page.tsx`
- 結果: `npm run dev`で起動し、`curl http://localhost:3000/user-list`でユーザー一覧（Emily Johnson, Michael Williams, ...）の表示を確認済み

```tsx
type User = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
};

type UsersResponse = {
  users: User[];
  total: number;
  skip: number;
  limit: number;
};

export default async function UserList() {
  const res = await fetch('https://dummyjson.com/users');

  if (!res.ok) {
    throw new Error(`Failed to fetch users: ${res.status}`);
  }

  const data: UsersResponse = await res.json();
  const users = data.users;

  return (
    <div>
      <h1>User List</h1>
      <ul>
        {users.map((user) => (
          <li key={user.id}>{user.firstName} {user.lastName}</li>
        ))}
      </ul>
    </div>
  );
}
```

- 型定義（`User`/`UsersResponse`）はコンポーネント関数の外に出す（再利用性・可読性のため）
- `fetch`はHTTPエラー（404/500等）でも例外を投げないため、`res.ok`をチェックして`throw`する（Server Componentsでthrowすると最寄りの`error.tsx`が表示される）

## つまずきの分析
- Q: `page.tsx`をnamed export（`export async function UserList()`）で書いたらどうなる？
  → 自分の回答: 表示されないと予想（理由の説明はやや曖昧だった）
  → 実際: その通り表示されない。App Routerの`page.tsx`は**default export**されたものだけをそのルートのUIとして認識する、という規約が理由。Next.js 16の公式ドキュメントでも同じ規約であることを確認済み
- Q: `dummyjson`はどこに配置する？
  → 誤解: ローカルに置くJSONファイルだと思っていた
  → 実際: `dummyjson.com`はダミーデータを返す外部APIサービス（`jsonplaceholder`と同じ立ち位置）。ローカル配置は不要で、URLとしてfetchするだけでよい
- Q: `const users: User[] = await res.json();`は何が問題？
  → 自分の回答: コンパイル時にエラーが起きると予想
  → 実際: `res.json()`の型は`Promise<any>`なので**コンパイルエラーにはならない**。実際に問題が起きるのは実行時（`users.map is not a function`）。型注釈は安全性を保証しないというTypeScriptの落とし穴
- 教訓: ①Next.jsの規約（default export必須）は基本だが見落としやすい ②外部APIのレスポンス形式は事前に実際のレスポンスで確認する習慣が大事 ③`any`型が絡む箇所は型注釈を過信しない

## 関連章
- Chapter9: ユーザー操作とデータフェッチ（トレードオフ①の詳細）
- Chapter11: クライアントとサーバーのバンドル境界（`"use server"`の詳細）
