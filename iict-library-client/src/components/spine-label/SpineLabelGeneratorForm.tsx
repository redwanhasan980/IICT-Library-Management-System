import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useGenerateSpineLabelMutation } from '../../services/spineLabel.api';
import { SpineLabel } from '../../types/spineLabel.types';
import SpineLabelPreview from './SpineLabelPreview';

const spineLabelSchema = z.object({
  accessionNumber: z.string().min(1, 'Accession number is required'),
  authorCode: z.string().min(1, 'Author code is required'),
  classificationNumber: z.string().min(1, 'Classification number is required'),
});

type SpineLabelFormValues = z.infer<typeof spineLabelSchema>;

const SpineLabelGeneratorForm: React.FC = () => {
  const [generatedLabel, setGeneratedLabel] = useState<SpineLabel | null>(null);
  const [generateSpineLabel, { isLoading, error }] = useGenerateSpineLabelMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SpineLabelFormValues>({
    resolver: zodResolver(spineLabelSchema),
  });

  const onSubmit: SubmitHandler<SpineLabelFormValues> = async (data) => {
    try {
      const response = await generateSpineLabel(data).unwrap();
      // @ts-ignore
      setGeneratedLabel(response.data.label);
    } catch (err) {
      console.error('Failed to generate spine label:', err);
      setGeneratedLabel(null);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleReset = () => {
    reset();
    setGeneratedLabel(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Spine Label Generator</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="form-control">
          <label htmlFor="classificationNumber" className="label">
            <span className="label-text">Classification Number (DDC)</span>
          </label>
          <input
            id="classificationNumber"
            type="text"
            {...register('classificationNumber')}
            className={`input input-bordered w-full ${errors.classificationNumber ? 'input-error' : ''}`}
          />
          {errors.classificationNumber && <p className="text-red-500 text-xs mt-1">{errors.classificationNumber.message}</p>}
        </div>

        <div className="form-control">
          <label htmlFor="authorCode" className="label">
            <span className="label-text">Author Code</span>
          </label>
          <input
            id="authorCode"
            type="text"
            {...register('authorCode')}
            className={`input input-bordered w-full ${errors.authorCode ? 'input-error' : ''}`}
          />
          {errors.authorCode && <p className="text-red-500 text-xs mt-1">{errors.authorCode.message}</p>}
        </div>

        <div className="form-control md:col-span-2">
          <label htmlFor="accessionNumber" className="label">
            <span className="label-text">Accession Number</span>
          </label>
          <input
            id="accessionNumber"
            type="text"
            {...register('accessionNumber')}
            className={`input input-bordered w-full ${errors.accessionNumber ? 'input-error' : ''}`}
          />
          {errors.accessionNumber && <p className="text-red-500 text-xs mt-1">{errors.accessionNumber.message}</p>}
        </div>

        <div className="md:col-span-2 flex items-center justify-end space-x-4">
          <button type="button" onClick={handleReset} className="btn btn-ghost">
            Reset
          </button>
          <button type="submit" className="btn btn-primary" disabled={isLoading}>
            {isLoading ? 'Generating...' : 'Generate Preview'}
          </button>
        </div>
      </form>

      {error && (
        <div className="alert alert-error shadow-lg mb-6">
          <div>
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {/* @ts-ignore */}
            <span>Error: {error.data?.message || 'An unexpected error occurred.'}</span>
          </div>
        </div>
      )}

      {generatedLabel && (
        <div className="border-t pt-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Label Preview</h3>
          <div className="flex justify-center printable-area">
            <SpineLabelPreview label={generatedLabel} />
          </div>
          <div className="mt-6 flex justify-end">
            <button onClick={handlePrint} className="btn btn-secondary">
              Print Label
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpineLabelGeneratorForm;
