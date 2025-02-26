'use client';

import { Suspense } from 'react';
import HomeClient from './HomeClient';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col p-6 md:p-12">
      <h1 className="text-3xl font-bold mb-8">Document Management System</h1>
      <Suspense fallback={
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4">Loading...</p>
        </div>
      }>
        <HomeClient />
      </Suspense>
    </main>
  );
}
