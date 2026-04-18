import { User } from './user.types';

export interface OutsideBookEntry {
  id: string;
  student: User;
  title: string;
  author: string;
  entryTime: string;
  exitTime?: string;
  isVerifiedEntry: boolean;
  isVerifiedExit: boolean;
  verifiedByEntry?: User;
  verifiedByExit?: User;
}
