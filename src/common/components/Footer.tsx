'use client';

export default function Footer() {
  return (
    <footer className="bg-gray-100 dark:bg-gray-900 py-6">
      <div className="container mx-auto px-4 text-center text-gray-600 dark:text-gray-400">
        <p>© {new Date().getFullYear()} DocumentAI. All rights reserved.</p>
      </div>
    </footer>
  );
}
