import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { BreadcrumbProps } from "@/utils/types/breadcrumb_props";

export function Breadcrumb({
  items = [],
  separator,
  className = "",
}: BreadcrumbProps) {
  if (!items || items.length === 0) {
    return null;
  }

  const defaultSeparator = (
    <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" aria-hidden="true" />
  );

  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center text-xs text-slate-500 select-none ${className}`}
    >
      <ol className="flex items-center gap-1.5 flex-wrap list-none p-0 m-0">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="hover:text-slate-800 transition-colors flex items-center gap-1"
                >
                  {item.icon && <span className="shrink-0">{item.icon}</span>}
                  <span>{item.label}</span>
                </Link>
              ) : isLast ? (
                <span
                  className="font-medium text-slate-800 flex items-center gap-1"
                  aria-current="page"
                >
                  {item.icon && <span className="shrink-0">{item.icon}</span>}
                  <span>{item.label}</span>
                </span>
              ) : (
                <span className="text-slate-400 flex items-center gap-1">
                  {item.icon && <span className="shrink-0">{item.icon}</span>}
                  <span>{item.label}</span>
                </span>
              )}

              {!isLast && (
                <span className="flex items-center" aria-hidden="true">
                  {separator || defaultSeparator}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default Breadcrumb;
