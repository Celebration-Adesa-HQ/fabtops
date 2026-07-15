import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { ProductBreadcrumbItem } from './pdp-model';

export function ProductBreadcrumbs({ items }: { items: ProductBreadcrumbItem[] }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-brand-dark/45"
    >
      {items.map((item, index) => (
        <span key={`${item.label}-${index}`} className="flex items-center gap-2">
          {item.href ? (
            <Link href={item.href} className="transition-colors hover:text-brand-primary">
              {item.label}
            </Link>
          ) : (
            <span className="text-brand-dark">{item.label}</span>
          )}
          {index < items.length - 1 ? <ChevronRight size={10} /> : null}
        </span>
      ))}
    </nav>
  );
}
