'use client';

import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <span className="text-lg font-semibold text-gray-900">
              {user.firstName} {user.lastName}
            </span>
            <span className="ml-4 px-2 py-1 text-sm bg-gray-100 text-gray-600 rounded-full">
              {user.role}
            </span>
          </div>
          
          <div className="flex items-center">
            <button
              onClick={logout}
              className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
} 