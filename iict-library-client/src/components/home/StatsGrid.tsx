interface StatItem {
  label: string;
  value: number | string;
  tone?: 'forest' | 'gold' | 'ink' | 'mist';
}

interface StatsGridProps {
  stats: StatItem[];
}

const toneClasses: Record<NonNullable<StatItem['tone']>, string> = {
  forest: 'bg-library-forest text-white',
  gold: 'bg-library-gold text-library-ink',
  ink: 'bg-library-ink text-white',
  mist: 'bg-library-mist text-library-ink',
};

const StatsGrid = ({ stats }: StatsGridProps) => {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
      {stats.map((item) => (
        <div
          key={item.label}
          className={`rounded-2xl border border-sandy-beige/70 p-5 shadow-sm ${toneClasses[item.tone ?? 'mist']}`}
        >
          <p className="text-sm font-semibold uppercase tracking-[0.14em] opacity-80">{item.label}</p>
          <p className="mt-3 text-3xl font-bold">{item.value}</p>
        </div>
      ))}
    </div>
  );
};

export default StatsGrid;
