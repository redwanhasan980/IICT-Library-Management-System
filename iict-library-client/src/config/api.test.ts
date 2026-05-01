import { describe, expect, it } from 'vitest';
import { selectApiBaseUrl } from './api';

describe('selectApiBaseUrl', () => {
  it('uses local API when ONLINE is false', () => {
    expect(
      selectApiBaseUrl({
        ONLINE: 'false',
        VITE_LOCAL_API_BASE_URL: 'http://localhost:5000/api',
        VITE_ONLINE_API_BASE_URL: 'https://iict-library-management-system-server.onrender.com/api',
      }, 'http://localhost:5173')
    ).toBe('http://localhost:5000/api');
  });

  it('uses and normalizes hosted API when ONLINE is true', () => {
    expect(
      selectApiBaseUrl({
        ONLINE: 'true',
        VITE_LOCAL_API_BASE_URL: 'http://localhost:5000/api',
        VITE_ONLINE_API_BASE_URL: 'https://iict-library-management-system-server.onrender.com/',
      }, 'http://localhost:5173')
    ).toBe('https://iict-library-management-system-server.onrender.com/api');
  });

  it('keeps VITE_ONLINE as a compatibility switch', () => {
    expect(
      selectApiBaseUrl({
        VITE_ONLINE: 'true',
        VITE_ONLINE_API_BASE_URL: 'https://iict-library-management-system-server.onrender.com',
      }, 'http://localhost:5173')
    ).toBe('https://iict-library-management-system-server.onrender.com/api');
  });

  it('keeps the legacy VITE_API_BASE_URL fallback', () => {
    expect(selectApiBaseUrl({ VITE_API_BASE_URL: 'http://localhost:5000' }, 'http://localhost:5173')).toBe('http://localhost:5000/api');
  });

  it('prevents hosted browser builds from calling localhost', () => {
    expect(
      selectApiBaseUrl({
        ONLINE: 'false',
        VITE_LOCAL_API_BASE_URL: 'http://localhost:5000/api',
        VITE_ONLINE_API_BASE_URL: 'https://iict-library-management-system-server.onrender.com/api',
      }, 'https://iict-library.onrender.com')
    ).toBe('https://iict-library-management-system-server.onrender.com/api');
  });
});
