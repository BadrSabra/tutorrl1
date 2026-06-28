import { Link, useLocation } from "wouter";
import { BookOpen, LineChart, Settings, Home, GraduationCap } from "lucide-react";
import { ReactNode } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { AppSettings } from "@/lib/types";

interface AppLayoutProps {
  children: ReactNode;
  hideSidebar?: boolean;
}

export function AppLayout({ children, hideSidebar = false }: AppLayoutProps) {
  const [location] = useLocation();
  const [settings] = useLocalStorage<AppSettings>("tutorrl_settings", {
    language: "ar",
    learningStyle: "step-by-step",
    theme: "light"
  });

  const isDark = settings.theme === "dark" || 
    (settings.theme === "auto" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    if (settings.language === "ar") {
      root.dir = "rtl";
    } else {
      root.dir = "ltr";
    }
  }, [isDark, settings.language]);

  const navItems = [
    { href: "/", icon: Home, label: settings.language === "ar" ? "الرئيسية" : "Home" },
    { href: "/subjects", icon: BookOpen, label: settings.language === "ar" ? "المواد الدراسية" : "Subjects" },
    { href: "/progress", icon: LineChart, label: settings.language === "ar" ? "مستوى التقدم" : "Progress" },
    { href: "/settings", icon: Settings, label: settings.language === "ar" ? "الإعدادات" : "Settings" },
  ];

  if (hideSidebar) {
    return <main className="min-h-[100dvh] bg-background text-foreground flex flex-col">{children}</main>;
  }

  return (
    <div className="flex h-[100dvh] w-full bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-sidebar border-l border-sidebar-border h-full">
        <div className="p-6 flex items-center gap-3 text-sidebar-primary">
          <div className="p-2 bg-primary/10 rounded-lg">
            <GraduationCap className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">TutorRL</h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}>
                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors cursor-pointer ${
                  isActive 
                    ? "bg-primary text-primary-foreground font-medium shadow-sm" 
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}>
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-y-auto relative">
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-sidebar border-t border-sidebar-border flex justify-around p-2 z-50 pb-safe">
        {navItems.map((item) => {
          const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href}>
              <div className={`flex flex-col items-center gap-1 p-2 rounded-lg ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}>
                <item.icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// Need to import useEffect for the side effect
import { useEffect } from "react";
