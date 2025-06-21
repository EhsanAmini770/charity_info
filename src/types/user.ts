export interface UserItem {
  _id: string;
  username: string;
  role: 'super-admin' | 'editor';
  slug: string;
  createdAt: string;
}

export interface UsersResponse {
  users: UserItem[];
}

export interface UserFormValues {
  username: string;
  password?: string;
  role: 'super-admin' | 'editor';
}
