import Navbar from './Navbar';
import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
      <footer className="bg-white/50 backdrop-blur-sm border-t border-teal-100 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-teal-600 text-sm">
            🌅 养老准备系统 · 让未来更安心
          </p>
          <p className="text-teal-400 text-xs mt-2">
            测算结果仅供参考，不构成任何投资建议
          </p>
        </div>
      </footer>
    </div>
  );
}
