import { fetchUser, User } from '../lib/fetcher';

export default async function PostItem({ userId }: { userId: number }) {
	const user: User = await fetchUser(userId);

	return (
		<>
			<h1>
				著者名：{user.firstName} {user.lastName}
			</h1>
		</>
	);
}
