import Comments from './components/Comments';
import PostBody from './components/PostBody';

export default async function Page({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;

	return (
		<>
			<PostBody postId={id} />
			<Comments postId={id} />
		</>
	);
}
