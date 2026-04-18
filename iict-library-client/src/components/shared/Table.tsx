import type { HTMLAttributes, ReactNode, TableHTMLAttributes, ThHTMLAttributes, TdHTMLAttributes } from 'react';

export const Table = ({ children, className = '', ...props }: TableHTMLAttributes<HTMLTableElement>) => (
  <div className="overflow-x-auto">
    <table className={`min-w-full divide-y divide-sandy-beige ${className}`} {...props}>
      {children}
    </table>
  </div>
);

export const TableHeader = ({ children, className = '', ...props }: HTMLAttributes<HTMLTableSectionElement>) => (
  <thead className={`bg-pale-cream ${className}`} {...props}>
    {children}
  </thead>
);

export const TableBody = ({ children, className = '', ...props }: HTMLAttributes<HTMLTableSectionElement>) => (
  <tbody className={`divide-y divide-sandy-beige ${className}`} {...props}>
    {children}
  </tbody>
);

export const TableRow = ({ children, className = '', ...props }: HTMLAttributes<HTMLTableRowElement>) => (
  <tr className={className} {...props}>
    {children}
  </tr>
);

export const TableHead = ({ children, className = '', ...props }: ThHTMLAttributes<HTMLTableCellElement> & { children: ReactNode }) => (
  <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-warm-taupe ${className}`} {...props}>
    {children}
  </th>
);

export const TableCell = ({ children, className = '', ...props }: TdHTMLAttributes<HTMLTableCellElement> & { children: ReactNode }) => (
  <td className={`px-4 py-3 text-sm text-dark-brown ${className}`} {...props}>
    {children}
  </td>
);
