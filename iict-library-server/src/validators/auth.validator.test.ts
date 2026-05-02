import { describe, expect, it } from 'vitest';
import { changePasswordSchema, registerSchema, updateProfileSchema } from './auth.validator';

describe('auth validation', () => {
  it('requires student phone number during registration', () => {
    const result = registerSchema.safeParse({
      body: {
        name: 'Student One',
        email: 'student@example.com',
        password: 'password123',
        role: 'STUDENT',
        studentRegNumber: 'REG-1',
        department: 'SWE',
      },
    });

    expect(result.success).toBe(false);
    expect(result.success ? '' : result.error.errors[0].message).toBe('Student phone number is required');
  });

  it('still requires teacher ID during teacher registration', () => {
    const result = registerSchema.safeParse({
      body: {
        name: 'Teacher One',
        email: 'teacher@example.com',
        password: 'password123',
        role: 'TEACHER',
        department: 'SWE',
      },
    });

    expect(result.success).toBe(false);
    expect(result.success ? '' : result.error.errors[0].message).toBe('Teacher ID is required');
  });

  it('validates profile update fields', () => {
    const result = updateProfileSchema.safeParse({
      body: {
        name: 'Updated User',
        email: 'updated@example.com',
        department: 'CSE',
        currentSemester: '5',
      },
    });

    expect(result.success).toBe(true);
  });

  it('requires current password when changing password', () => {
    const result = changePasswordSchema.safeParse({
      body: {
        newPassword: 'password123',
      },
    });

    expect(result.success).toBe(false);
    expect(result.success ? '' : result.error.errors[0].message).toBe('Current password is required');
  });
});
