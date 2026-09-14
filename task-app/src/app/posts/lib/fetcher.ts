import 'server-only';

export type PostResponse = {
	id: number;
	title: string;
	body: string;
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

export async function fetchUser(id: number): Promise<User> {
	const res = await fetch(`https://dummyjson.com/users/${id}`);

	if (!res.ok) {
		throw new Error(`Failed to fetch user: ${res.status}`);
	}

	const data: User = await res.json();
	return data;
}
