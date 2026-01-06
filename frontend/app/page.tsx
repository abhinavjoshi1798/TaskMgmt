'use client';

import Link from 'next/link';
import { Button } from 'antd';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-6">
          Welcome to Task Management Application
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground mb-8">
          Login to use the app for free.
        </p>
        <Link href="/login">
          <Button type="primary" size="large" className="h-12 px-8 text-lg">
            Get Started
          </Button>
        </Link>
      </div>
    </div>
  );
}
