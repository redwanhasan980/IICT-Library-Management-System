export interface ApiSuccessResponse<T> {
  success: true;
  message?: string;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: unknown;
}

export const successResponse = <T>(
  data: T,
  message?: string
): ApiSuccessResponse<T> => ({
  success: true,
  message,
  data,
});

export const errorResponse = (
  message: string,
  errors?: unknown
): ApiErrorResponse => ({
  success: false,
  message,
  errors,
});
