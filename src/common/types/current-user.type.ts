import { UserRole } from '../enums';

export type CurrentUser = {
  id: string;

  email: string;

  role: UserRole;

  sessionId: string;
};
