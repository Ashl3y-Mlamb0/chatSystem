export interface User {
  _id: string;
  username: string;
  email: string;
  roles: string[]; // 'Super Admin', 'Group Admin', 'User'
  groups: string[];
  avatar: string;
}
