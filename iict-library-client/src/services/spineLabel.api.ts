import { api } from '../config/api';
import { SpineLabel, SpineLabelInput } from '../types/spineLabel.types';

export const spineLabelApi = api.injectEndpoints({
  endpoints: (builder) => ({
    generateSpineLabel: builder.mutation<SpineLabel, SpineLabelInput>({
      query: (credentials) => ({
        url: '/spine-labels/generate',
        method: 'POST',
        body: credentials,
      }),
    }),
  }),
});

export const { useGenerateSpineLabelMutation } = spineLabelApi;
