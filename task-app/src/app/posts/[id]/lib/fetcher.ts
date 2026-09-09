import 'server-only';

export type CommentResponse = {
	id: number;
	body: string;
};

export type PostResponse = {
	title: string;
};

export async function fetchPost(id: string): Promise<PostResponse> {
	const res = await fetch(`https://dummyjson.com/posts/${id}`);

	if (!res.ok) {
		throw new Error(`Failed to fetch post: ${res.status}`);
	}

	const data = await res.json();
	return data;
}

export async function fetchPostComments(
	id: string,
): Promise<CommentResponse[]> {
	const res = await fetch(`https://dummyjson.com/posts/${id}/comments`);

	if (!res.ok) {
		throw new Error(`Failed to fetch post comments: ${res.status}`);
	}

	const data = await res.json();
	return data.comments;
}
