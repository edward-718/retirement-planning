import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Calculator, FileText, Target, MapPin, Menu, X } from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { to: '/', label: '首页', icon: LayoutDashboard },
  { to: '/calculator', label: '测算', icon: Calculator },
  { to: '/blueprint', label: '蓝图', icon: FileText },
  { to: '/progress', label: '进度', icon: Target },
  { to: '/cities', label: '城市', icon: MapPin },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-teal-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center">
              <span className="text-white text-lg">🌅</span>
            </div>
            <span className="font-serif text-xl font-bold text-teal-800">养老准备系统</span>
          </div>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-teal-600 text-white shadow-md'
                      : 'text-teal-700 hover:bg-teal-50'
                  }`
                }
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>

          <button
            className="md:hidden p-2 rounded-lg text-teal-700 hover:bg-teal-50"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-teal-100 animate-fade-in">
          <div className="px-4 py-3 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all ${
                    isActive
                      ? 'bg-teal-600 text-white'
                      : 'text-teal-700 hover:bg-teal-50'
                  }`
                }
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
