import 'server-only';
import DataLoader from 'dataloader';
import * as React from 'react';

export type PostResponse = {
	id: number;
	title: string;
	body: string;
	userId: number;
};

export type User = {
	id: number;
	firstName: string;
	lastName: string;
	email: string;
};

export async function fetchPosts(): Promise<PostResponse[]> {
	const res = await fetch('https://dummyjson.com/posts');
	if (!res.ok) {
		throw new Error(`Failed to fetch posts: ${res.status}`);
	}
	const data = await res.json();
	return data.posts;
}

async function batchGetUser(keys: readonly number[]): Promise<User[]> {
	console.log('API実行', keys);
	const res = await fetch('https://dummyjson.com/users?limit=0');
	if (!res.ok) {
		throw new Error(`Failed to fetch users: ${res.status}`);
	}
	const data: { users: User[] } = await res.json();

	// ata.usersからkeysの順序通りに並べ直す → DataLoaderのバッチ関数には「keysと同じ順序・同じ長さの配列を返す」という決まりがあります。keysが[3, 1, 2]で呼ばれたら、返す配列も[id=3のuser, id=1のuser, id=2のuser]という順序でなければいけません（そうしないとload(1)が別のユーザーの結果を受け取ってしまいます）。
	return keys.map((key) => data.users.find((user) => user.id === key)!);
}

const getUserLoader = React.cache(() => new DataLoader(batchGetUser));

export async function fetchUser(id: number): Promise<User> {
	const userLoader = getUserLoader();
	return userLoader.load(id);
}
