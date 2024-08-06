// src/components/NavLink.tsx
'use client';

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
}

export default function NavLink({ href, children }: NavLinkProps) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Link 
      href={href} 
      className={`px-3 py-2 rounded text-sm font-medium transition-colors duration-150 ease-in-out ${
        isActive 
          ? 'bg-blue-700 text-white' 
          : 'text-blue-100 hover:bg-blue-500'
      }`}
    >
      {children}
    </Link>
  )
}