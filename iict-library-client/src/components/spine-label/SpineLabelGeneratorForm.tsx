import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useGenerateSpineLabelMutation } from '../../services/spineLabel.api';
import type { SpineLabel } from '../../types/spineLabel.types';
import SpineLabelPreview from './SpineLabelPreview';
import { Button } from '../shared/Button';

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
      const label = await generateSpineLabel(data).unwrap();
      setGeneratedLabel(label);
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
    <div className="paper-surface mx-auto max-w-4xl p-6">
      <h2 className="mb-6 text-2xl font-bold text-library-ink">Spine Label Generator</h2>

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
          {errors.classificationNumber && <p className="mt-1 text-xs font-semibold text-rose-800">{errors.classificationNumber.message}</p>}
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
          {errors.authorCode && <p className="mt-1 text-xs font-semibold text-rose-800">{errors.authorCode.message}</p>}
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
          {errors.accessionNumber && <p className="mt-1 text-xs font-semibold text-rose-800">{errors.accessionNumber.message}</p>}
        </div>

        <div className="md:col-span-2 flex flex-wrap items-center justify-end gap-3">
          <Button type="button" onClick={handleReset} variant="ghost">
            Reset
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Generating...' : 'Generate Preview'}
          </Button>
        </div>
      </form>

      {error && (
        <div className="mb-6 border-2 border-rose-950 bg-rose-50 p-4 text-rose-800 shadow-[3px_3px_0_#1a1c1a]">
          <div>
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>Error: An unexpected error occurred.</span>
          </div>
        </div>
      )}

      {generatedLabel && (
        <div className="border-t-2 border-library-ink pt-6">
          <h3 className="mb-4 text-xl font-semibold text-library-ink">Label Preview</h3>
          <div className="flex justify-center printable-area">
            <SpineLabelPreview label={generatedLabel} />
          </div>
          <div className="mt-6 flex justify-end">
            <Button onClick={handlePrint} variant="secondary">
              Print Label
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpineLabelGeneratorForm;
