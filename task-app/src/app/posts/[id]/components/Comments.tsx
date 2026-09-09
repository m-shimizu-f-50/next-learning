import { CommentResponse, fetchPostComments } from '../lib/fetcher';

export default async function Comments({ postId }: { postId: string }) {
	const comments = await fetchPostComments(postId);
	return (
		<>
			<h3>Comments</h3>
			<ul>
				{comments.map((comment: CommentResponse) => (
					<li key={comment.id}>{comment.body}</li>
				))}
			</ul>
		</>
	);
}
