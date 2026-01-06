'use client';

import Link from 'next/link';
import { Button } from 'antd';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-4xl font-semibold text-foreground mb-4">
          Page Not Found
        </h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
          Sorry, we couldn't find the page you're looking for.</p>
        <div className="flex gap-4 justify-center">
          <Link href="/login">
            <Button type="primary" size="large">
              Go to Login
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
