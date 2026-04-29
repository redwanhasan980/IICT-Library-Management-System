import { Link } from 'react-router-dom';

export interface QuickAction {
  to: string;
  label: string;
  description: string;
}

interface QuickActionsProps {
  title?: string;
  actions: QuickAction[];
}

const QuickActions = ({ title = 'Quick Actions', actions }: QuickActionsProps) => {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold text-library-ink">{title}</h2>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {actions.map((action) => (
          <Link
            key={action.to}
            to={action.to}
            className="rounded-2xl border border-sandy-beige/70 bg-white/85 p-5 shadow-sm transition hover:-translate-y-0.5 hover:bg-library-mist/70 hover:shadow-md"
          >
            <h3 className="text-lg font-semibold text-library-ink">{action.label}</h3>
            <p className="mt-2 text-sm leading-6 text-warm-taupe">{action.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default QuickActions;
