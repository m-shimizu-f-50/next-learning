import { fetchPosts, PostResponse } from './lib/fetcher';

export default async function Page() {
	const posts: PostResponse[] = await fetchPosts();
	return (
		<div>
			<h1>Posts</h1>
			<ul>
				{posts.map((post) => (
					<li key={post.id}>
						<h2>{post.title}</h2>
						<p>{post.body}</p>
					</li>
				))}
			</ul>
		</div>
	);
}
