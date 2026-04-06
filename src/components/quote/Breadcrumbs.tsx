'use client';
import Link from 'next/link';

interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav className="flex items-center gap-1.5 text-sm text-zinc-400 mb-4">
      {crumbs.map((crumb, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <span className="text-zinc-300">\</span>}
          {crumb.href ? (
            <Link href={crumb.href} className="hover:text-zinc-700 transition-colors">
              {crumb.label}
            </Link>
          ) : (
            <span className="text-zinc-700 font-medium">{crumb.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
