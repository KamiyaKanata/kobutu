"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Package, BookOpen, Home, MessageSquare, Calculator, LogOut } from "lucide-react";
import { logout } from "@/lib/auth";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "ホーム", icon: Home },
  { href: "/items", label: "商品管理", icon: Package },
  { href: "/ledger", label: "古物台帳", icon: BookOpen },
  { href: "/customer-reply", label: "顧客対応", icon: MessageSquare },
  { href: "/pre-estimate", label: "事前査定", icon: Calculator },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <aside
      className="w-56 flex-shrink-0 h-screen sticky top-0 flex flex-col border-r"
      style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
    >
      <div className="p-5 border-b" style={{ borderColor: "var(--border)" }}>
        <h1 className="text-lg font-medium" style={{ fontFamily: "var(--font-display)" }}>
          AI古物
        </h1>
        <p className="text-xs mt-0.5" style={{ color: "var(--ink-tertiary)" }}>
          サンプル質店
        </p>
      </div>

      <nav className="flex-1 p-3 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors",
                isActive ? "font-medium" : "hover:bg-gray-50"
              )}
              style={
                isActive
                  ? { background: "rgba(27,58,91,0.08)", color: "var(--accent)" }
                  : { color: "var(--ink-secondary)" }
              }
            >
              <Icon size={16} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t" style={{ borderColor: "var(--border)" }}>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded text-sm w-full hover:bg-gray-50 transition-colors"
          style={{ color: "var(--ink-secondary)" }}
        >
          <LogOut size={16} />
          ログアウト
        </button>
      </div>
    </aside>
  );
}
