"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  LayoutGrid,
  Globe,
  Code,
  Palette,
  Server,
  Key,
  FileCode,
  Settings,
  Github,
  X,
} from "lucide-react";

interface SidebarProps {
  closeSidebar?: () => void;
}

export function Sidebar({ closeSidebar }: SidebarProps) {
  const pathname = usePathname();
  
  const navItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutGrid,
    },
    {
      title: "Websites",
      href: "/dashboard/websites",
      icon: Globe,
    },
    {
      title: "Editor",
      href: "/dashboard/editor",
      icon: Code,
    },
    {
      title: "Templates",
      href: "/dashboard/templates",
      icon: Palette,
    },
    {
      title: "API",
      href: "/dashboard/api",
      icon: Server,
    },
    {
      title: "API Keys",
      href: "/dashboard/api-keys",
      icon: Key,
    },
    {
      title: "Exports",
      href: "/dashboard/exports",
      icon: FileCode,
    },
    {
      title: "GitHub",
      href: "/dashboard/github",
      icon: Github,
    },
    {
      title: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
    },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="h-14 flex items-center justify-between px-4 border-b">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
            W
          </div>
          <span className="font-semibold">WebBuilder</span>
        </Link>
        {closeSidebar && (
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={closeSidebar}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close sidebar</span>
          </Button>
        )}
      </div>
      <ScrollArea className="flex-1 py-4">
        <nav className="grid gap-1 px-2">
          {navItems.map((item) => (
            <Button
              key={item.href}
              variant={pathname === item.href ? "secondary" : "ghost"}
              className={cn(
                "justify-start",
                pathname === item.href ? "bg-secondary" : ""
              )}
              asChild
            >
              <Link href={item.href}>
                <item.icon className="mr-2 h-4 w-4" />
                {item.title}
              </Link>
            </Button>
          ))}
        </nav>
      </ScrollArea>
      <div className="p-4 border-t">
        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-sm font-medium">Need help?</p>
          <p className="text-sm text-muted-foreground mt-1 mb-3">
            Check our documentation for guides and API references.
          </p>
          <Button variant="outline" size="sm" className="w-full" asChild>
            <Link href="/docs">View Documentation</Link>
          </Button>
        </div>
      </div>
    </div>
  );
} 