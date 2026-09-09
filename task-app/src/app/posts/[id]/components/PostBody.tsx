import { fetchPost, PostResponse } from '../lib/fetcher';

export default async function PostBody({ postId }: { postId: string }) {
	const post: PostResponse = await fetchPost(postId);
	return (
		<>
			<h2>{post.title}</h2>
		</>
	);
}
