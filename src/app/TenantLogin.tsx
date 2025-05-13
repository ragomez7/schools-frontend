"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "./context/AuthContext";

export default function TenantLogin() {
  const router = useRouter();
  const { user } = useAuth();
  if (user?.id) return undefined;
  // If user is already authenticated, redirect to dashboard
  // if (isAuthenticated) {
  //   router.push('/');
  //   return null;
  // }

  return (
    <div className="text-center">
      <h1 className="text-3xl font-bold mb-4">Welcome!</h1>
      <p className="text-gray-600 mb-8">
        Please sign in or register to continue
      </p>

      <div className="space-x-4">
        <button
          onClick={() => router.push("/login")}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Login
        </button>
        <button
          onClick={() => router.push("/register")}
          className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
        >
          Register
        </button>
      </div>
    </div>
  );
}
