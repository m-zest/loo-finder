import { MapPin, Info, Shield, Menu, X } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  onAboutClick: () => void;
}

export default function Header({ onAboutClick }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white shadow-lg z-50">
      <div className="max-w-full mx-auto px-4 py-2.5">
        <div className="flex items-center justify-between">
          <a href="#/" className="flex items-center gap-2.5">
            <div className="bg-white/20 backdrop-blur-sm p-1.5 rounded-lg">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold tracking-tight leading-tight">
                Budapest Loo Finder
              </h1>
              <p className="text-[10px] md:text-xs text-blue-200 hidden sm:block leading-tight">
                Find free toilets near you
              </p>
            </div>
          </a>

          <nav className="hidden md:flex items-center gap-3">
            <button
              onClick={onAboutClick}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-all text-sm font-medium"
            >
              <Info className="w-4 h-4" />
              About
            </button>
            <a
              href="#/admin"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-all text-sm font-medium"
            >
              <Shield className="w-4 h-4" />
              Admin
            </a>
          </nav>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <nav className="md:hidden mt-3 pt-3 border-t border-white/20 flex flex-col gap-2 pb-1">
            <button
              onClick={() => { onAboutClick(); setMobileMenuOpen(false); }}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-lg transition-all text-sm font-medium"
            >
              <Info className="w-4 h-4" />
              About
            </button>
            <a
              href="#/admin"
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-lg transition-all text-sm font-medium"
            >
              <Shield className="w-4 h-4" />
              Admin Panel
            </a>
          </nav>
        )}
      </div>
    </header>
  );
}
