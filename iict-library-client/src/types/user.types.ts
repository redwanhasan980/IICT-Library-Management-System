export const Role = {
  ADMIN: 'ADMIN',
  STUDENT: 'STUDENT',
  TEACHER: 'TEACHER',
} as const;

export type Role = (typeof Role)[keyof typeof Role];

export interface User {
  id: string;
  name?: string;
  email: string;
  role: Role;
  isActive?: boolean;
  student?: {
    studentRegNumber?: string;
    department?: string;
    currentSemester?: number;
  };
  teacher?: {
    teacherId?: string;
    department?: string;
    designation?: string;
    signatureData?: string;
  };
}
