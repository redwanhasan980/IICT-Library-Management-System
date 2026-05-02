interface StatItem {
  label: string;
  value: number | string;
  tone?: 'forest' | 'gold' | 'ink' | 'mist';
}

interface StatsGridProps {
  stats: StatItem[];
}

const shadeClasses = [
  'bg-[#fff0bc]',
  'bg-[#f7e3a2]',
  'bg-[#f1d8b2]',
  'bg-[#ffe7c8]',
  'bg-[#e9d6a8]',
  'bg-[#fff6c9]',
  'bg-[#eadfc2]',
];

const StatsGrid = ({ stats }: StatsGridProps) => {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
      {stats.map((item, index) => (
        <div
          key={item.label}
          className={`border-2 border-library-ink p-5 text-library-ink shadow-[5px_5px_0_#1a1c1a] ${shadeClasses[index % shadeClasses.length]}`}
        >
          <p className="text-sm font-semibold uppercase tracking-[0.14em] opacity-80">{item.label}</p>
          <p className="mt-3 text-3xl font-bold">{item.value}</p>
        </div>
      ))}
    </div>
  );
};

export default StatsGrid;
