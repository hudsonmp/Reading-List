'use client';

import { Plus, List, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();
  const { data: session } = useSession();

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col items-center justify-center relative p-4">
      {/* Profile Button */}
      <Link
        href="/profile"
        className="absolute top-4 right-4 p-3 rounded-full bg-white shadow-md hover:shadow-lg transition-all duration-300 group"
      >
        <User className="w-6 h-6 text-gray-600 group-hover:text-blue-600" />
      </Link>

      {/* View List Button */}
      <Link
        href="/list"
        className="absolute top-4 left-4 p-3 rounded-full bg-white shadow-md hover:shadow-lg transition-all duration-300 group"
      >
        <List className="w-6 h-6 text-gray-600 group-hover:text-blue-600" />
      </Link>

      {/* Main Add Button */}
      <button
        onClick={() => router.push('/add')}
        className="group relative flex items-center justify-center"
      >
        <div className="absolute -inset-4 bg-blue-500 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
        <div className="bg-white p-8 rounded-full shadow-lg group-hover:shadow-xl transition-all duration-300">
          <Plus className="w-12 h-12 text-blue-600 group-hover:scale-110 transition-transform duration-300" />
        </div>
      </button>
      <h2 className="mt-8 text-xl text-gray-700 font-light">Add to Reading List</h2>
      
      {/* Welcome Message */}
      <div className="absolute bottom-8 text-center">
        <p className="text-gray-600">
          {session ? `Welcome, ${session.user?.name}` : 'Sign in to save your reading list'}
        </p>
      </div>
    </main>
  );
} 