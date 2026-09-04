import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "HOME" },
  { href: "/explore", label: "EXPLORE" },
  { href: "/now-spinning", label: "NOW SPINNING" },
  { href: "/agenda", label: "AGENDA" },
] as const;

function isActive(path: string, href: string) {
  if (href === "/") return path === "/";
  return path.startsWith(href);
}

export function BottomNav() {
  const [path] = useLocation();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-moodify-border bg-black/95 backdrop-blur-sm md:hidden">
      <ul className="grid grid-cols-4 px-2 pt-3 pb-5">
        {NAV_ITEMS.map((item) => {
          const active = isActive(path, item.href);
          return (
            <li key={item.href} className="text-center">
              <Link
                href={item.href}
                className={cn(
                  "font-mono text-[10px] tracking-wider uppercase transition-colors",
                  active ? "text-lime" : "text-moodify-muted"
                )}
              >
                <span className="relative inline-block pb-1.5">
                  {item.label}
                  {active && (
                    <span className="absolute left-1/2 -translate-x-1/2 bottom-0 h-[2px] w-8 bg-lime" />
                  )}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function SideNav() {
  const [path] = useLocation();

  return (
    <aside className="hidden md:flex md:flex-col md:w-56 lg:w-64 shrink-0 border-r border-moodify-border bg-black min-h-screen sticky top-0">
      <div className="px-6 py-8 border-b border-moodify-border">
        <p className="font-mono text-lime text-sm tracking-widest font-semibold">MOODIFY</p>
        <p className="font-mono text-moodify-muted text-[10px] tracking-wider mt-1">SYS_ACTIVE</p>
      </div>
      <nav className="flex flex-col gap-1 p-4">
        {NAV_ITEMS.map((item) => {
          const active = isActive(path, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "font-mono text-xs tracking-widest uppercase px-3 py-3 border transition-colors",
                active
                  ? "text-lime border-lime bg-lime/5"
                  : "text-moodify-muted border-transparent hover:text-white hover:border-moodify-border"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto p-6 border-t border-moodify-border">
        <p className="font-mono text-[10px] text-moodify-muted tracking-wider">
          EDITORIAL // HUD
        </p>
      </div>
    </aside>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-black text-white flex">
      <SideNav />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 pb-24 md:pb-8">{children}</main>
        <BottomNav />
      </div>
    </div>
  );
}
