import type { HTMLAttributes, ReactNode, TableHTMLAttributes, ThHTMLAttributes, TdHTMLAttributes } from 'react';

export const Table = ({ children, className = '', ...props }: TableHTMLAttributes<HTMLTableElement>) => (
  <div className="w-full overflow-x-auto rounded-2xl border border-sandy-beige/60">
    <table className={`min-w-full divide-y divide-sandy-beige/70 ${className}`} {...props}>
      {children}
    </table>
  </div>
);

export const TableHeader = ({ children, className = '', ...props }: HTMLAttributes<HTMLTableSectionElement>) => (
  <thead className={`bg-library-mist/70 ${className}`} {...props}>
    {children}
  </thead>
);

export const TableBody = ({ children, className = '', ...props }: HTMLAttributes<HTMLTableSectionElement>) => (
  <tbody className={`divide-y divide-sandy-beige/70 ${className}`} {...props}>
    {children}
  </tbody>
);

export const TableRow = ({ children, className = '', ...props }: HTMLAttributes<HTMLTableRowElement>) => (
  <tr className={`transition-colors hover:bg-library-mist/40 ${className}`} {...props}>
    {children}
  </tr>
);

export const TableHead = ({ children, className = '', ...props }: ThHTMLAttributes<HTMLTableCellElement> & { children: ReactNode }) => (
  <th className={`px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.2em] text-warm-taupe ${className}`} {...props}>
    {children}
  </th>
);

export const TableCell = ({ children, className = '', ...props }: TdHTMLAttributes<HTMLTableCellElement> & { children: ReactNode }) => (
  <td className={`px-4 py-3 text-sm text-library-ink ${className}`} {...props}>
    {children}
  </td>
);
