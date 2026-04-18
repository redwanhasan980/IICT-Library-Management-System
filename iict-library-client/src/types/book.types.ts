import type { User } from './user.types';

export interface StudentRef {
  id: string;
  user?: User;
}

export interface OutsideBookEntry {
  id: string;
  student?: StudentRef;
  title: string;
  author: string;
  entryTime: string;
  exitTime?: string;
  isVerifiedEntry: boolean;
  isVerifiedExit: boolean;
  verifiedByEntry?: User;
  verifiedByExit?: User;
}
