"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PlusCircle, User } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", icon: Home, label: "首页" },
  { href: "/create", icon: PlusCircle, label: "创建" },
  { href: "/dashboard", icon: User, label: "我的" },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="bg-white/80 backdrop-blur-xl border-t border-slate-200">
        <div className="flex items-center justify-around h-16 px-2">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
                  isActive
                    ? "text-blue-400"
                    : "text-slate-400 hover:text-slate-500"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
                {isActive && (
                  <div className="absolute top-0 h-0.5 w-8 bg-blue-500 rounded-b-full" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
