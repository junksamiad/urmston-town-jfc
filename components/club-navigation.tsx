"use client"

import { FloatingNav } from "@/components/ui/floating-navbar"
import Image from "next/image"
import { 
  Home, 
  Calendar, 
  Trophy, 
  Users, 
  Phone,
  Newspaper
} from "lucide-react"

export function ClubNavigation() {
  const navItems = [
    {
      name: "Home",
      link: "/",
      icon: <Home className="h-4 w-4 text-neutral-500 dark:text-white" />,
    },
    {
      name: "Fixtures",
      link: "/fixtures",
      icon: <Calendar className="h-4 w-4 text-neutral-500 dark:text-white" />,
    },
    {
      name: "Teams",
      link: "/teams",
      icon: <Users className="h-4 w-4 text-neutral-500 dark:text-white" />,
    },
    {
      name: "Results",
      link: "/results",
      icon: <Trophy className="h-4 w-4 text-neutral-500 dark:text-white" />,
    },
    {
      name: "News",
      link: "/news",
      icon: <Newspaper className="h-4 w-4 text-neutral-500 dark:text-white" />,
    },
    {
      name: "Contact",
      link: "/contact",
      icon: <Phone className="h-4 w-4 text-neutral-500 dark:text-white" />,
    },
  ]

  return (
    <FloatingNav 
      navItems={navItems}
      className="bg-white/90 backdrop-blur-md border border-gray-200/20"
    />
  )
}

// Alternative: Static header with logo for the fixtures page
export function ClubHeader() {
  return (
    <header className="bg-[#244cbc] text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Page Title */}
          <div className="flex items-center space-x-4">
            <Image 
              src="/images/utfc-badge.png"
              alt="Urmston Town Juniors FC Badge"
              width={50}
              height={50}
              className="rounded-full"
            />
            <div>
              <h1 className="text-2xl font-bold">Fixtures & Results</h1>
              <p className="text-blue-100 text-sm">Urmston Town Juniors FC</p>
            </div>
          </div>

          {/* Back Navigation */}
          <nav className="flex items-center">
            <a href="https://urmstontownjfc.co.uk" className="flex items-center space-x-2 hover:text-blue-200 transition-colors font-medium bg-white/10 px-4 py-2 rounded-lg">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back</span>
            </a>
          </nav>
        </div>
      </div>
    </header>
  )
}