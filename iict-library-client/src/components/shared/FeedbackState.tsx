import { Button } from './Button';

interface LoadingStateProps {
  message?: string;
}

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

interface EmptyStateProps {
  message?: string;
}

export const LoadingState = ({ message = 'Loading...' }: LoadingStateProps) => {
  return <p className="py-6 text-center text-warm-taupe">{message}</p>;
};

export const ErrorState = ({
  message = 'Something went wrong.',
  onRetry,
}: ErrorStateProps) => {
  return (
    <div className="space-y-3 py-6 text-center">
      <p className="font-semibold text-rose-800">{message}</p>
      {onRetry ? (
        <Button variant="secondary" onClick={onRetry}>
          Retry
        </Button>
      ) : null}
    </div>
  );
};

export const EmptyState = ({ message = 'No data found.' }: EmptyStateProps) => {
  return <p className="py-8 text-center text-warm-taupe">{message}</p>;
};
