import { useState } from 'react';
import { useCreateOutsideBookEntryMutation } from '../services/outsideBook.api';
import { Button } from '../components/shared/Button';
import { Card } from '../components/shared/Card';
import { Input } from '../components/shared/Input';
import { toast } from 'react-hot-toast';

const OutsideBookEntryForm = () => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [createEntry, { isLoading }] = useCreateOutsideBookEntryMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !author) {
      toast.error('Title and Author are required');
      return;
    }
    try {
      await createEntry({ title, author }).unwrap();
      toast.success('Entry created successfully!');
      setTitle('');
      setAuthor('');
    } catch (error) {
      toast.error('Failed to create entry.');
    }
  };

  return (
    <Card>
      <h2 className="text-xl font-semibold text-dark-brown mb-4">
        Register Outside Book
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-warm-taupe">
            Book Title
          </label>
          <Input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter book title"
            disabled={isLoading}
          />
        </div>
        <div>
          <label htmlFor="author" className="block text-sm font-medium text-warm-taupe">
            Author
          </label>
          <Input
            id="author"
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Enter author's name"
            disabled={isLoading}
          />
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
