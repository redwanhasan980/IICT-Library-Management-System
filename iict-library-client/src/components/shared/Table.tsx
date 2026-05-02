import type { HTMLAttributes, ReactNode, TableHTMLAttributes, ThHTMLAttributes, TdHTMLAttributes } from 'react';

export const Table = ({ children, className = '', ...props }: TableHTMLAttributes<HTMLTableElement>) => (
  <div className="w-full overflow-x-auto border-2 border-library-ink bg-pale-cream shadow-[4px_4px_0_#1a1c1a]">
    <table className={`min-w-full divide-y-2 divide-library-ink ${className}`} {...props}>
      {children}
    </table>
  </div>
);

export const TableHeader = ({ children, className = '', ...props }: HTMLAttributes<HTMLTableSectionElement>) => (
  <thead className={`bg-library-mist ${className}`} {...props}>
    {children}
  </thead>
);

export const TableBody = ({ children, className = '', ...props }: HTMLAttributes<HTMLTableSectionElement>) => (
  <tbody className={`divide-y divide-library-ink/30 ${className}`} {...props}>
    {children}
  </tbody>
);

export const TableRow = ({ children, className = '', ...props }: HTMLAttributes<HTMLTableRowElement>) => (
  <tr className={`transition-colors hover:bg-paper-soft ${className}`} {...props}>
    {children}
  </tr>
);

export const TableHead = ({ children, className = '', ...props }: ThHTMLAttributes<HTMLTableCellElement> & { children: ReactNode }) => (
  <th className={`px-4 py-3 text-left text-[11px] font-extrabold uppercase tracking-[0.18em] text-library-ink ${className}`} {...props}>
    {children}
  </th>
);

export const TableCell = ({ children, className = '', ...props }: TdHTMLAttributes<HTMLTableCellElement> & { children: ReactNode }) => (
  <td className={`px-4 py-3 text-sm text-library-ink ${className}`} {...props}>
    {children}
  </td>
);
