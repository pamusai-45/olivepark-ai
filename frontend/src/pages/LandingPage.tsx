import React from 'react';
import { 
  Car, 
  QrCode, 
  ShieldCheck, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  FileText, 
  ArrowRight, 
  Sparkles,
  Zap,
  Cpu
} from 'lucide-react';
import { ParkingLocation } from '../types';
import { LocationCard } from '../components/LocationCard';

interface LandingPageProps {
  locations: ParkingLocation[];
  onSelectLocation: (loc: ParkingLocation) => void;
  onOpenQR: (loc?: ParkingLocation) => void;
  onNavigate: (tab: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  locations,
  onSelectLocation,
  onOpenQR,
  onNavigate
}) => {
  return (
    <div className="space-y-16 sm:space-y-24 pb-16 animate-fadeIn">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-8 pb-12 sm:pt-14 sm:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EBF0DC] border border-[#CCD8B3] text-xs font-bold text-[#49542D] shadow-xs">
                <Sparkles className="w-4 h-4 text-[#7B8450]" />
                <span>Next-Gen Smart Parking · Solapur, Maharashtra</span>
              </div>

              <h1 className="font-['Manrope'] font-extrabold text-4xl sm:text-5xl lg:text-6xl text-[#30372A] tracking-tight leading-[1.12]">
                Park Smarter. <br />
                <span className="text-[#7B8450]">Pay Seamlessly.</span>
              </h1>

              <p className="text-base sm:text-lg text-[#616954] max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Effortless QR check-in, transparent municipal tariffs, instant digital receipts, and AI license-plate detection at Solapur's premier civic destinations.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <button
                  onClick={() => onNavigate('find-parking')}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#7B8450] hover:bg-[#687042] text-[#FFFDF6] px-7 py-4 rounded-2xl font-bold text-base shadow-lg transition-all hover:scale-102 active:scale-98"
                >
                  <MapPin className="w-5 h-5" />
                  <span>Find Parking</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onOpenQR()}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#E9EED9] hover:bg-[#DDE4C7] text-[#3B4228] border border-[#CCD6B5] px-7 py-4 rounded-2xl font-bold text-base shadow-sm transition-all hover:scale-102"
                >
                  <QrCode className="w-5 h-5 text-[#60693E]" />
                  <span>Scan QR Code</span>
                </button>
              </div>

              {/* Quick Trust Highlights */}
              <div className="pt-6 border-t border-[#E8E5D5] grid grid-cols-3 gap-4 text-center lg:text-left">
                <div>
                  <span className="font-['Manrope'] font-extrabold text-xl sm:text-2xl text-[#30372A] block">2</span>
                  <span className="text-xs text-[#757C67]">Designated Locations</span>
                </div>
                <div>
                  <span className="font-['Manrope'] font-extrabold text-xl sm:text-2xl text-[#7B8450] block">&lt; 30s</span>
                  <span className="text-xs text-[#757C67]">Average Check-in Time</span>
                </div>
                <div>
                  <span className="font-['Manrope'] font-extrabold text-xl sm:text-2xl text-[#30372A] block">100%</span>
                  <span className="text-xs text-[#757C67]">Digital Receipts</span>
                </div>
              </div>

            </div>

            {/* Right Hero Graphic: Simulated Kiosk & Parking Visual */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md bg-gradient-to-br from-[#FFFDF6] to-[#F3EFE0] p-6 rounded-3xl border border-[#DFDCB7] shadow-2xl space-y-5">
                
                {/* Floating Badge */}
                <div className="absolute -top-3.5 -right-3.5 bg-[#7B8450] text-[#FFFDF6] px-3.5 py-1 rounded-full text-xs font-bold shadow-md flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Instant Check-In</span>
                </div>

                <div className="flex items-center justify-between pb-3 border-b border-[#E8E5D5]">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-[#7B8450] text-white flex items-center justify-center">
                      <Car className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#30372A]">OlivePark Smart Kiosk</h4>
                      <p className="text-[10px] text-[#787F6A]">Solapur Parking Zone</p>
                    </div>
                  </div>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#4D7C50] animate-pulse"></span>
                </div>

                {/* Simulated Location Status Badge */}
                <div className="p-3.5 rounded-2xl bg-[#FFFDF6] border border-[#E5E2D1] space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-[#30372A]">Kambar Talav</span>
                    <span className="text-[#4D7C50] font-semibold">38 Free Spots</span>
                  </div>
                  <div className="w-full bg-[#E7E4D3] h-2 rounded-full overflow-hidden">
                    <div className="bg-[#7B8450] h-full rounded-full" style={{ width: '42%' }}></div>
                  </div>
                  <div className="flex justify-between text-[10px] text-[#7A816C]">
                    <span>Occupancy: 42%</span>
                    <span>Car ₹40/hr · Bike ₹20/hr</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#FFFDF6] border border-[#E5E2D1] space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-[#30372A]">Siddheshwar Mandir</span>
                    <span className="text-[#4D7C50] font-semibold">46 Free Spots</span>
                  </div>
                  <div className="w-full bg-[#E7E4D3] h-2 rounded-full overflow-hidden">
                    <div className="bg-[#7B8450] h-full rounded-full" style={{ width: '45%' }}></div>
                  </div>
                  <div className="flex justify-between text-[10px] text-[#7A816C]">
                    <span>Occupancy: 45%</span>
                    <span>Car ₹50/hr · Bike ₹25/hr</span>
                  </div>
                </div>

                {/* Simulated Quick Action button */}
                <button
                  onClick={() => onOpenQR()}
                  className="w-full bg-[#7B8450] hover:bg-[#687042] text-[#FFFDF6] py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Simulate Standee QR Check-in</span>
                </button>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. LOCATIONS SHOWCASE (Strictly 2 locations) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#7B8450] bg-[#EEF2E2] px-3 py-1 rounded-full">
            Supported Solapur Destinations
          </span>
          <h2 className="font-['Manrope'] font-bold text-3xl sm:text-4xl text-[#30372A]">
            Select Your Parking Location
          </h2>
          <p className="text-sm text-[#666D57]">
            OlivePark AI is exclusively dedicated to Solapur's prominent religious and recreational hubs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {locations.map((loc) => (
            <LocationCard
              key={loc.id}
              location={loc}
              onSelect={onSelectLocation}
              onOpenQR={onOpenQR}
            />
          ))}
        </div>
      </section>

      {/* 3. HOW IT WORKS (4 STEPS) */}
      <section className="bg-[#EFECE1]/60 border-y border-[#E2DFD0] py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#7B8450] bg-[#FFFDF6] px-3 py-1 rounded-full border border-[#DEDAC8]">
              Seamless Workflow
            </span>
            <h2 className="font-['Manrope'] font-bold text-3xl sm:text-4xl text-[#30372A]">
              How OlivePark AI Works
            </h2>
            <p className="text-sm text-[#676E59]">
              Four simple steps from arrival to digital receipt. No paper slips, no queues.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="card-elevation p-6 rounded-2xl bg-[#FFFDF6] space-y-3 relative">
              <div className="w-10 h-10 rounded-xl bg-[#7B8450] text-[#FFFDF6] flex items-center justify-center font-bold text-base shadow-sm">
                1
              </div>
              <h3 className="font-bold text-lg text-[#30372A]">
                Select Location
              </h3>
              <p className="text-xs text-[#6A715D] leading-relaxed">
                Choose between Kambar Talav or Siddheshwar Mandir with live capacity insights and directions.
              </p>
            </div>

            <div className="card-elevation p-6 rounded-2xl bg-[#FFFDF6] space-y-3 relative">
              <div className="w-10 h-10 rounded-xl bg-[#7B8450] text-[#FFFDF6] flex items-center justify-center font-bold text-base shadow-sm">
                2
              </div>
              <h3 className="font-bold text-lg text-[#30372A]">
                Scan QR Standee
              </h3>
              <p className="text-xs text-[#6A715D] leading-relaxed">
                Scan the on-site QR standee with your camera or tap our 1-click interactive demo standee.
              </p>
            </div>

            <div className="card-elevation p-6 rounded-2xl bg-[#FFFDF6] space-y-3 relative">
              <div className="w-10 h-10 rounded-xl bg-[#7B8450] text-[#FFFDF6] flex items-center justify-center font-bold text-base shadow-sm">
                3
              </div>
              <h3 className="font-bold text-lg text-[#30372A]">
                Vehicle Details &amp; AI
              </h3>
              <p className="text-xs text-[#6A715D] leading-relaxed">
                Input vehicle number or scan via OpenCV OCR module. Tariffs are calculated server-side.
              </p>
            </div>

            <div className="card-elevation p-6 rounded-2xl bg-[#FFFDF6] space-y-3 relative">
              <div className="w-10 h-10 rounded-xl bg-[#7B8450] text-[#FFFDF6] flex items-center justify-center font-bold text-base shadow-sm">
                4
              </div>
              <h3 className="font-bold text-lg text-[#30372A]">
                Pay &amp; PDF Receipt
              </h3>
              <p className="text-xs text-[#6A715D] leading-relaxed">
                Complete verified payment and instantly download an official PDF pass with security QR.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 4. KEY SYSTEM HIGHLIGHTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="font-['Manrope'] font-bold text-3xl text-[#30372A]">
            Built for Reliability &amp; Transparency
          </h2>
          <p className="text-sm text-[#666D57]">
            Designed with enterprise standards for civic infrastructure in Solapur.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-[#FFFDF6] border border-[#E5E5D5] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#EEF2E2] text-[#7B8450] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-[#30372A]">
              Cryptographic Payment Verification
            </h3>
            <p className="text-xs text-[#6C745E] leading-relaxed">
              Every transaction signature is verified on the Flask backend before active parking status and PDF receipts are granted.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#FFFDF6] border border-[#E5E5D5] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#EEF2E2] text-[#7B8450] flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-[#30372A]">
              ReportLab Server-Side PDF
            </h3>
            <p className="text-xs text-[#6C745E] leading-relaxed">
              Download and print tamper-evident parking passes with verification tokens and attendant validation URLs.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#FFFDF6] border border-[#EEF2E2] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#EEF2E2] text-[#7B8450] flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-[#30372A]">
              Modular OpenCV Vision
            </h3>
            <p className="text-xs text-[#6C745E] leading-relaxed">
              Computer vision pipeline detects vehicle registration plates with driver confirmation and transparent confidence metrics.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
};
