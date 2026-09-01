type User = {
	id: number;
	firstName: string;
	lastName: string;
	email: string;
};

type UsersResponse = {
	users: User[];
	total: number;
	skip: number;
	limit: number;
};

export default async function UserList() {
	const res = await fetch('https://dummyjson.com/users');

	if (!res.ok) {
		throw new Error(`Failed to fetch users: ${res.status}`);
	}

	const data: UsersResponse = await res.json();
	const users = data.users;

	return (
		<div>
			<h1>User List</h1>
			<ul>
				{users.map((user) => (
					<li key={user.id}>
						{user.firstName} {user.lastName}
					</li>
				))}
			</ul>
		</div>
	);
}
