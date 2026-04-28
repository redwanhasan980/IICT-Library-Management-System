interface ApiIssue {
  message?: string;
  path?: Array<string | number>;
}

export const getApiErrorMessage = (error: unknown, fallback: string) => {
  const payload = error as { data?: { message?: string; errors?: ApiIssue[] } };
  const firstIssue = Array.isArray(payload.data?.errors) ? payload.data?.errors[0] : undefined;

  if (firstIssue?.message) {
    const path = firstIssue.path?.join('.');
    return path ? `${path}: ${firstIssue.message}` : firstIssue.message;
  }

  return payload.data?.message || fallback;
};
