import { api } from '../config/api';
import type { SpineLabel, SpineLabelInput } from '../types/spineLabel.types';
import type { ApiResponse } from '../types/api.types';

export const spineLabelApi = api.injectEndpoints({
  endpoints: (builder) => ({
    generateSpineLabel: builder.mutation<SpineLabel, SpineLabelInput>({
      query: (credentials) => ({
        url: '/spine-labels/generate',
        method: 'POST',
        body: credentials,
      }),
      transformResponse: (response: ApiResponse<SpineLabel>) => response.data,
    }),
  }),
});

export const { useGenerateSpineLabelMutation } = spineLabelApi;
