import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { getProfile } from "@/lib/profile";

export type Crumb = { label: string; href?: string };

export function SiteShell({ children, breadcrumbs = [] }: { children: ReactNode; breadcrumbs?: Crumb[] }) {
  const profile = getProfile();
  const theme = {
    "--background": profile.theme.background_color,
    "--text": profile.theme.text_color,
    "--accent": profile.theme.accent_color,
  } as CSSProperties;
  const crumbs: Crumb[] = [{ label: "home", href: "/" }, ...breadcrumbs];
  return (
    <main style={theme}>
      <article className="document">
        <nav className="site-nav">
          {crumbs.map((crumb, i) => (
            <span key={i}>
              {i > 0 && " / "}
              {crumb.href ? <Link href={crumb.href}>{crumb.label}</Link> : crumb.label}
            </span>
          ))}
        </nav>
        {children}
      </article>
    </main>
  );
}
