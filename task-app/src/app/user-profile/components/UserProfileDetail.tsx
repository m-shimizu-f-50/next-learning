import { fetchUser } from '../lib/fetchUser';
export default async function UserProfileDetail() {
	const user = await fetchUser();

	return (
		<div>
			<p>Email: {user.email}</p>
		</div>
	);
}
