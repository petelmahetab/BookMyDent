"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import { CalendarIcon, CrownIcon, HomeIcon, MicIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Badge } from "./ui/badge";

function Navbar() {
  const { user, isLoaded } = useUser();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  // ✅ Only render on client after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const isPro = user?.publicMetadata?.isPro === true;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-2 border-b border-border/50 bg-background/80 backdrop-blur-md h-16">
      <div className="max-w-7xl mx-auto flex justify-between items-center h-full">
        {/* LOGO */}
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image src="/logo.png" alt="DentWise Logo" width={32} height={32} className="w-11" />
          </Link>

          <div className="flex items-center gap-6">
            <Link
              href="/dashboard"
              className={`flex items-center gap-2 transition-colors ${
                pathname === "/dashboard"
                  ? "text-foreground hover:text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <HomeIcon className="w-4 h-4" />
              <span className="hidden md:inline">Dashboard</span>
            </Link>

            <Link
              href="/appointments"
              className={`flex items-center gap-2 transition-colors hover:text-foreground ${
                pathname === "/appointments" ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              <CalendarIcon className="w-4 h-4" />
              <span className="hidden md:inline">Appointments</span>
            </Link>

            <Link
              href="/voice"
              className={`flex items-center gap-2 transition-colors hover:text-foreground ${
                pathname === "/voice" ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              <MicIcon className="w-4 h-4" />
              <span className="hidden md:inline">Voice</span>
              {mounted && isPro && (
                <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-[10px]">
                  PRO
                </Badge>
              )}
            </Link>

            <Link
              href="/pro"
              className={`flex items-center gap-2 transition-colors hover:text-foreground ${
                pathname === "/pro" ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              <CrownIcon className="w-4 h-4" />
              <span className="hidden md:inline">Pro</span>
            </Link>
          </div>
        </div>

        {/* RIGHT SECTION */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            {mounted && isLoaded && user && (
              <div className="hidden lg:flex flex-col items-end">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">
                    {user.firstName} {user.lastName}
                  </span>
                  {isPro && (
                    <Badge className="bg-gradient-to-r from-amber-500 to-amber-600">
                      <CrownIcon className="w-3 h-3 mr-1" />
                      PRO
                    </Badge>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {user.emailAddresses?.[0]?.emailAddress}
                </span>
              </div>
            )}

            {/* ✅ Only render UserButton after mounted */}
            {mounted && <UserButton />}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;