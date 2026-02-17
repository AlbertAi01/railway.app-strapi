import Link from 'next/link';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
      <div className="flex flex-col items-center gap-6 max-w-md px-6">
        <div className="text-center space-y-2">
          <h1 className="text-8xl font-bold text-[#FFE500]">404</h1>
          <h2 className="text-2xl font-bold text-white">Page Not Found</h2>
          <p className="text-gray-400 text-sm">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        <Link
          href="/"
          className="flex items-center gap-2 px-6 py-3 bg-[#111] text-[#FFE500] font-medium rounded-lg border border-[#222] hover:bg-[#222] transition-colors"
        >
          <Home className="w-5 h-5" />
          Back to Home
        </Link>
      </div>
    </div>
  );
}
