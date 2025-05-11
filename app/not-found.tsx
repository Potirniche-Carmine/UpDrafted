import Link from 'next/link';
import { HomeIcon, AlertTriangleIcon } from 'lucide-react'; 

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center text-center min-h-[calc(100vh-20rem)] px-4 sm:px-6 lg:px-8">
      <AlertTriangleIcon className="w-16 h-16 text-primary mb-6" />

      <h1 className="text-5xl sm:text-7xl font-bold text-primary tracking-tight">
        404
      </h1>

      <p className="mt-4 text-2xl sm:text-3xl font-semibold text-foreground">
        Oops! Page Not Found.
      </p>

      <p className="mt-3 text-base text-muted-foreground max-w-md">
        Sorry, the page you are looking for doesn&apos;t exist or has been moved.
        Let&apos;s get you back on track.
      </p>

      <div className="mt-10">
        <Link
          href="/"
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring"
        >
          <HomeIcon className="mr-2 -ml-1 h-5 w-5" aria-hidden="true" />
          Go back home
        </Link>
      </div>
    </div>
  );
}
