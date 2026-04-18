export enum Role {
  ADMIN = 'ADMIN',
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}
