import { MapPin, Info, Menu, X } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  onAboutClick: () => void;
}

export default function Header({ onAboutClick }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 text-white shadow-xl z-50">
      <div className="max-w-full mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <a href="#/" className="flex items-center gap-3 group">
            <div className="bg-white/15 backdrop-blur-sm p-2 rounded-xl group-hover:bg-white/25 transition-all">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold tracking-tight leading-tight">
                Budapest Loo Finder
              </h1>
              <p className="text-[11px] text-blue-300 hidden sm:block leading-tight font-medium">
                Community-powered free toilet map
              </p>
            </div>
          </a>

          <nav className="hidden md:flex items-center gap-2">
            <button
              onClick={onAboutClick}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-sm font-medium border border-white/10"
            >
              <Info className="w-4 h-4" />
              About
            </button>
          </nav>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-white/10 rounded-xl transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <nav className="md:hidden mt-3 pt-3 border-t border-white/15 pb-1">
            <button
              onClick={() => { onAboutClick(); setMobileMenuOpen(false); }}
              className="w-full flex items-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-sm font-medium"
            >
              <Info className="w-4 h-4" />
              About This Project
            </button>
          </nav>
        )}
      </div>
    </header>
  );
}
