export interface UserDetails {
  id: unknown;
  role: string;
  displayName?: string;
  email: string;
  position?: string;
  department?: string;
  avatarUrl?: string | null;
  bio?: string;
}
