import { AccountStatus, Role } from '@app/common';

export interface UserSearchFilter {
  email?: string;
  name?: string;
  role?: Role;
  status?: AccountStatus;
  emailVerified?: boolean;
  createdFrom?: string;               // YYYY-MM-DD
  createdTo?: string;                 // YYYY-MM-DD, inclusive
  sortBy?: 'createdAt' | 'name' | 'email';
  sortOrder?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
}

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  primaryRole: Role;
  status: AccountStatus;
  emailVerified: boolean;
  createdAt: Date;
}

export interface PagedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}