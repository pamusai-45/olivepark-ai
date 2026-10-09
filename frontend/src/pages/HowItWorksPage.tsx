import React from 'react';
import { 
  MapPin, 
  QrCode, 
  Car, 
  CreditCard, 
  FileText, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight,
  ShieldCheck,
  Cpu
} from 'lucide-react';

interface HowItWorksPageProps {
  onStartBooking: () => void;
}

export const HowItWorksPage: React.FC<HowItWorksPageProps> = ({ onStartBooking }) => {
  const steps = [
    {
      number: '01',
      title: 'Select Solapur Location',
      description: 'Choose between Kambar Talav and Siddheshwar Mandir. View live availability, landmark directions, and official municipal hourly tariffs before arrival.',
      icon: MapPin,
      badge: 'Solapur Geo-Zone'
    },
    {
      number: '02',
      title: 'Scan On-Site QR Standee',
      description: 'Use your smartphone camera or our 1-click interactive demo standees to scan the entrance QR code. The system verifies zone and rate rules automatically.',
      icon: QrCode,
      badge: 'Camera & Demo'
    },
    {
      number: '03',
      title: 'Vehicle Registration & AI OCR',
      description: 'Input your license plate number or snap a picture for instant OpenCV computer vision plate recognition. The backend calculates billable hours accurately.',
      icon: Cpu,
      badge: 'AI OpenCV Vision'
    },
    {
      number: '04',
      title: 'Pay & Instant Digital Pass',
      description: 'Checkout securely using Demo Mode or Razorpay testnet. Receive a tamper-evident PDF receipt with verification QR code for seamless exit gate verification.',
      icon: CreditCard,
      badge: 'ReportLab PDF'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 animate-fadeIn">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EBF0DC] text-xs font-bold text-[#4B552F]">
          <Sparkles className="w-3.5 h-3.5 text-[#7B8450]" />
          <span>User Journey Guide</span>
        </div>
        <h1 className="font-['Manrope'] font-bold text-3xl sm:text-4xl text-[#30372A]">
          How OlivePark AI Operates
        </h1>
        <p className="text-sm text-[#6C735F]">
          A hassle-free parking experience built specifically for Solapur's civic venues.
        </p>
      </div>

      {/* 4 Steps Showcase */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div 
              key={step.number}
              className="card-elevation p-7 rounded-3xl bg-[#FFFDF6] border border-[#E5E5D5] space-y-4 relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <span className="font-['Manrope'] font-black text-3xl text-[#7B8450]/30">
                  {step.number}
                </span>
                <span className="text-[11px] font-bold bg-[#EEF2E2] text-[#4A542D] px-2.5 py-0.5 rounded-full">
                  {step.badge}
                </span>
              </div>

              <div className="w-12 h-12 rounded-2xl bg-[#EEF2E2] text-[#7B8450] flex items-center justify-center">
                <Icon className="w-6 h-6" />
              </div>

              <div className="space-y-1.5">
                <h3 className="font-['Manrope'] font-bold text-xl text-[#30372A]">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#6B735E] leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom CTA Card */}
      <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-[#EEF3E3] to-[#E3E8D0] border border-[#CCD8B3] text-center space-y-4 shadow-sm">
        <h3 className="font-['Manrope'] font-bold text-2xl text-[#30372A]">
          Ready to experience frictionless parking?
        </h3>
        <p className="text-xs sm:text-sm text-[#5D654E] max-w-lg mx-auto">
          Choose a parking spot at Kambar Talav or Siddheshwar Mandir right now.
        </p>
        <button
          onClick={onStartBooking}
          className="inline-flex items-center gap-2 bg-[#7B8450] hover:bg-[#687042] text-[#FFFDF6] px-8 py-3.5 rounded-2xl font-bold text-sm shadow-md transition-all hover:scale-102"
        >
          <span>Find Parking Now</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
