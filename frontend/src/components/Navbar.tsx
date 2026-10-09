import React, { useState } from 'react';
import { 
  Car, 
  QrCode, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Menu, 
  X, 
  Compass, 
  HelpCircle 
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenQRScanner: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  activeTab, 
  setActiveTab, 
  onOpenQRScanner 
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'landing', label: 'Home', icon: Compass },
    { id: 'find-parking', label: 'Find Parking', icon: MapPin },
    { id: 'how-it-works', label: 'How It Works', icon: HelpCircle },
    { id: 'my-parking', label: 'My Parking', icon: Clock },
    { id: 'admin', label: 'Admin Portal', icon: ShieldCheck },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FFFDF6]/90 backdrop-blur-md border-b border-[#E5E5D5] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand */}
          <div 
            onClick={() => handleNavClick('landing')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#7B8450] to-[#5F663C] flex items-center justify-center text-[#FFFDF6] shadow-md group-hover:scale-105 transition-transform duration-200">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-['Manrope'] font-extrabold text-2xl text-[#30372A] tracking-tight">
                  OlivePark <span className="text-[#7B8450]">AI</span>
                </span>
                <span className="text-[10px] font-semibold bg-[#DDE4C7] text-[#4A532C] px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Solapur
                </span>
              </div>
              <p className="text-xs text-[#777A69] font-medium hidden sm:block">
                Smart Parking · Kambar Talav &amp; Siddheshwar Mandir
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-[#7B8450] text-[#FFFDF6] shadow-sm'
                      : 'text-[#4D5444] hover:bg-[#F2EFE0] hover:text-[#30372A]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#FFFDF6]' : 'text-[#777A69]'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Action: QR Scanner CTA */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={onOpenQRScanner}
              className="flex items-center gap-2 bg-[#E9EED9] hover:bg-[#DDE4C7] text-[#3B4228] border border-[#CCD6B5] px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all hover:scale-102 active:scale-98"
            >
              <QrCode className="w-4 h-4 text-[#60693E]" />
              <span>Scan QR Code</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={onOpenQRScanner}
              className="p-2.5 rounded-xl bg-[#E9EED9] text-[#3B4228]"
              title="Scan QR"
            >
              <QrCode className="w-5 h-5" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl text-[#30372A] hover:bg-[#F2EFE0]"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E5E5D5] bg-[#FFFDF6] px-4 pt-3 pb-6 space-y-2 shadow-lg animate-fadeIn">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all ${
                  isActive
                    ? 'bg-[#7B8450] text-[#FFFDF6]'
                    : 'text-[#4D5444] hover:bg-[#F2EFE0]'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-[#FFFDF6]' : 'text-[#777A69]'}`} />
                {item.label}
              </button>
            );
          })}
          <div className="pt-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenQRScanner();
              }}
              className="w-full flex items-center justify-center gap-2 bg-[#7B8450] text-[#FFFDF6] py-3 rounded-xl font-semibold shadow-md"
            >
              <QrCode className="w-5 h-5" />
              Scan Parking QR Code
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
