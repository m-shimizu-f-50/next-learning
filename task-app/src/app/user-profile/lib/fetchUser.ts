export type User = {
	id: number;
	firstName: string;
	lastName: string;
	email: string;
};

export async function fetchUser() {
	const res = await fetch(`https://dummyjson.com/users/1`);

	if (!res.ok) {
		throw new Error(`Failed to fetch user: ${res.status}`);
	}

	const data: User = await res.json();
	return data;
}
