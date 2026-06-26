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
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-teal-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center shadow-md">
                <span className="text-white text-base sm:text-lg">🌅</span>
              </div>
              <span className="font-serif text-lg sm:text-xl font-bold text-teal-800">养老准备系统</span>
            </div>

            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-teal-600 text-white shadow-md'
                        : 'text-teal-700 hover:bg-teal-50'
                    }`
                  }
                >
                  <item.icon size={18} className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
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

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-teal-100 px-2 py-2 safe-area-bottom">
        <div className="flex items-center justify-around">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${
                  isActive
                    ? 'text-teal-600 nav-active'
                    : 'text-teal-400'
                }`
              }
            >
              <item.icon size={22} className="transition-transform duration-200" />
              <span className="text-xs font-medium">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  );
}
