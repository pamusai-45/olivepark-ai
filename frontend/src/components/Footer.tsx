import React from 'react';
import { Car, MapPin, ShieldCheck, Heart, ExternalLink } from 'lucide-react';

interface FooterProps {
  setActiveTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveTab }) => {
  return (
    <footer className="bg-[#EFECE1] border-t border-[#E2DFD0] mt-auto text-[#4A5141]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-[#7B8450] flex items-center justify-center text-[#FFFDF6]">
                <Car className="w-5 h-5" />
              </div>
              <span className="font-['Manrope'] font-bold text-xl text-[#30372A]">
                OlivePark <span className="text-[#7B8450]">AI</span>
              </span>
            </div>
            <p className="text-sm text-[#6C735F] leading-relaxed">
              Park Smarter. Pay Seamlessly. AI-assisted municipal smart parking management for Solapur, Maharashtra.
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E3E8D3] text-xs font-semibold text-[#444E2F]">
              <span className="w-2 h-2 rounded-full bg-[#4D7C50] animate-pulse"></span>
              Live Solapur Testnet
            </div>
          </div>

          {/* Locations */}
          <div className="space-y-3">
            <h4 className="font-semibold text-[#30372A] text-sm uppercase tracking-wider">
              Solapur Locations
            </h4>
            <ul className="space-y-2 text-sm text-[#5B634E]">
              <li>
                <button 
                  onClick={() => setActiveTab('find-parking')}
                  className="flex items-center gap-2 hover:text-[#7B8450] text-left transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#7B8450]" />
                  <span>Kambar Talav, Solapur</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveTab('find-parking')}
                  className="flex items-center gap-2 hover:text-[#7B8450] text-left transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#7B8450]" />
                  <span>Siddheshwar Mandir, Solapur</span>
                </button>
              </li>
              <li className="pt-1 text-xs text-[#828876] italic">
                *Strictly configured for these 2 designated municipal locations only.
              </li>
            </ul>
          </div>

          {/* Quick Navigation */}
          <div className="space-y-3">
            <h4 className="font-semibold text-[#30372A] text-sm uppercase tracking-wider">
              Quick Navigation
            </h4>
            <ul className="space-y-2 text-sm text-[#5B634E]">
              <li>
                <button onClick={() => setActiveTab('landing')} className="hover:text-[#7B8450] transition-colors">
                  Home &amp; Overview
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('find-parking')} className="hover:text-[#7B8450] transition-colors">
                  Find Available Parking
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('how-it-works')} className="hover:text-[#7B8450] transition-colors">
                  How It Works (4 Steps)
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('my-parking')} className="hover:text-[#7B8450] transition-colors">
                  My Parking Sessions &amp; Receipts
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('admin')} className="hover:text-[#7B8450] flex items-center gap-1 transition-colors">
                  <span>Admin Dashboard</span>
                  <ExternalLink className="w-3 h-3 text-[#777A69]" />
                </button>
              </li>
            </ul>
          </div>

          {/* Transparency & Demo Notice */}
          <div className="space-y-3">
            <h4 className="font-semibold text-[#30372A] text-sm uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#7B8450]" />
              Demo &amp; Compliance
            </h4>
            <p className="text-xs text-[#6C735F] leading-relaxed">
              Equipped with Razorpay test mode &amp; Demo Payment fallback. All availability values are configurable demo estimates until on-ground sensor verification.
            </p>
            <div className="pt-2 text-xs text-[#808773] border-t border-[#DFDBC8]">
              Designed with nature-inspired aesthetics in light olive, cream, and sage green.
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 mt-8 border-t border-[#E2DFD0] flex flex-col sm:flex-row items-center justify-between text-xs text-[#7B826F] gap-4">
          <p>© 2026 OlivePark AI. Solapur Smart Parking Initiative.</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-[#7B8450] fill-[#7B8450]" /> for Solapur, Maharashtra
          </p>
        </div>
      </div>
    </footer>
  );
};
