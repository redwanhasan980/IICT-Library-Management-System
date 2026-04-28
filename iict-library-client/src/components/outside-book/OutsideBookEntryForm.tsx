import { useCreateOutsideBookEntryMutation } from '../../services/outsideBook.api';
import { Button } from '../shared/Button';
import { Card } from '../shared/Card';
import { Input } from '../shared/Input';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const entrySchema = z.object({
  title: z.string().min(1, 'Book title is required'),
  author: z.string().min(1, 'Author is required'),
  studentRegNumber: z.string().min(1, 'Student registration number is required'),
  department: z.enum(['CSE', 'SWE', 'EEE'], { message: 'Department is required' }),
  currentSemester: z.coerce.number().int().positive('Current semester must be a positive number'),
});

type EntryFormInput = z.input<typeof entrySchema>;
type EntryFormValues = z.output<typeof entrySchema>;

const OutsideBookEntryForm = () => {
  const [createEntry, { isLoading }] = useCreateOutsideBookEntryMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EntryFormInput, unknown, EntryFormValues>({
    resolver: zodResolver(entrySchema),
    defaultValues: {
      department: 'SWE',
    },
  });

  const onSubmit = async (values: EntryFormValues) => {
    if (isLoading) {
      return;
    }
    try {
      await createEntry(values).unwrap();
      toast.success('Entry created successfully!');
      reset();
    } catch (error) {
      toast.error('Failed to create entry.');
    }
  };

  return (
    <Card>
      <h2 className="text-xl font-semibold text-dark-brown mb-4">
        Register Outside Book
      </h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-warm-taupe">
            Book Title
          </label>
          <Input
            id="title"
            type="text"
            placeholder="Enter book title"
            disabled={isLoading}
            {...register('title')}
          />
          {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>}
        </div>
        <div>
          <label htmlFor="author" className="block text-sm font-medium text-warm-taupe">
            Author
          </label>
          <Input
            id="author"
            type="text"
            placeholder="Enter author's name"
            disabled={isLoading}
            {...register('author')}
          />
          {errors.author && <p className="mt-1 text-xs text-red-600">{errors.author.message}</p>}
        </div>
        <div>
          <label htmlFor="studentRegNumber" className="block text-sm font-medium text-warm-taupe">
            Student Registration Number
          </label>
          <Input
            id="studentRegNumber"
            type="text"
            placeholder="e.g., 2020-1-60-123"
            disabled={isLoading}
            {...register('studentRegNumber')}
          />
          {errors.studentRegNumber && <p className="mt-1 text-xs text-red-600">{errors.studentRegNumber.message}</p>}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="department" className="block text-sm font-medium text-warm-taupe">
              Department
            </label>
            <select
              id="department"
              className="mt-1 w-full rounded-xl border border-sandy-beige/80 bg-white/80 px-3 py-2 text-sm text-library-ink focus:border-library-gold focus:outline-none focus:ring-2 focus:ring-library-gold/30"
              disabled={isLoading}
              {...register('department')}
            >
              <option value="CSE">CSE</option>
              <option value="SWE">SWE</option>
              <option value="EEE">EEE</option>
            </select>
            {errors.department && <p className="mt-1 text-xs text-red-600">{errors.department.message}</p>}
          </div>
          <div>
            <label htmlFor="currentSemester" className="block text-sm font-medium text-warm-taupe">
              Current Semester
            </label>
            <Input
              id="currentSemester"
              type="number"
              min={1}
              placeholder="e.g., 6"
              disabled={isLoading}
              {...register('currentSemester')}
            />
            {errors.currentSemester && <p className="mt-1 text-xs text-red-600">{errors.currentSemester.message}</p>}
          </div>
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Submitting...' : 'Submit Entry'}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default OutsideBookEntryForm;
