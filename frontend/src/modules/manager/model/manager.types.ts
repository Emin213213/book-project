export interface Manager {
  id: number;
  name: string;
  email: string;
  role: 'senior' | 'manager';
  avatar: string | null;
}
