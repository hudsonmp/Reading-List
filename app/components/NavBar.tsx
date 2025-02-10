'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Book, List, User, Plus } from 'lucide-react';

export default function NavBar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-4 sm:py-0 sm:px-0 sm:top-0 sm:bottom-auto">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between sm:h-16">
          {/* Logo/Home */}
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-900 hover:text-blue-600 transition-colors"
          >
            <Book className="w-6 h-6" />
            <span className="font-medium hidden sm:inline">Reading List</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center justify-center gap-1 sm:gap-2">
            {/* Add Content */}
            <Link
              href="/similar"
              className={`
                flex flex-col sm:flex-row items-center gap-1 px-3 py-2 rounded-lg
                transition-colors
                ${isActive('/similar')
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                }
              `}
            >
              <Plus className="w-5 h-5" />
              <span className="text-xs sm:text-sm">Add</span>
            </Link>

            {/* Reading List */}
            <Link
              href="/list"
              className={`
                flex flex-col sm:flex-row items-center gap-1 px-3 py-2 rounded-lg
                transition-colors
                ${isActive('/list')
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                }
              `}
            >
              <List className="w-5 h-5" />
              <span className="text-xs sm:text-sm">List</span>
            </Link>

            {/* Profile */}
            <Link
              href="/profile"
              className={`
                flex flex-col sm:flex-row items-center gap-1 px-3 py-2 rounded-lg
                transition-colors
                ${isActive('/profile')
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                }
              `}
            >
              <User className="w-5 h-5" />
              <span className="text-xs sm:text-sm">
                {session ? 'Profile' : 'Sign In'}
              </span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
} 