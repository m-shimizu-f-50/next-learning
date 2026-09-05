import { fetchUser } from '../lib/fetchUser';

export default async function UserProfileHeader() {
	const user = await fetchUser();

	return (
		<header>
			<h1>
				{user.firstName} {user.lastName}
			</h1>
		</header>
	);
}
