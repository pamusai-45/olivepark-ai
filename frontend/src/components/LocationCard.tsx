import React, { useState } from 'react';
import { 
  MapPin, 
  Car, 
  Bike, 
  ExternalLink, 
  QrCode, 
  ArrowRight, 
  CheckCircle2, 
  Info,
  Clock,
  Sparkles
} from 'lucide-react';
import { ParkingLocation } from '../types';

interface LocationCardProps {
  location: ParkingLocation;
  onSelect: (location: ParkingLocation) => void;
  onOpenQR: (location: ParkingLocation) => void;
}

export const LocationCard: React.FC<LocationCardProps> = ({ 
  location, 
  onSelect, 
  onOpenQR 
}) => {
  const [showQRModal, setShowQRModal] = useState(false);

  const occupancyRate = Math.round((location.current_occupied / location.total_capacity) * 100);
  const isAlmostFull = occupancyRate > 85;

  return (
    <div className="card-elevation rounded-3xl p-6 sm:p-7 bg-[#FFFDF6] border border-[#E5E5D5] flex flex-col justify-between relative overflow-hidden transition-all duration-300 hover:-translate-y-1">
      {/* Top Tag & Status */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EEF2E2] text-[#4E5632] text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-[#7B8450]" />
          <span>Solapur City Zone</span>
        </div>
        {location.is_demo_data && (
          <span className="text-[11px] font-medium text-[#777A69] bg-[#F1EFE3] px-2.5 py-0.5 rounded-full border border-[#E0DDCB]">
            Demo Sensor Data
          </span>
        )}
      </div>

      {/* Title & Address */}
      <div className="space-y-2 mb-5">
        <h3 className="font-['Manrope'] font-bold text-2xl text-[#30372A] tracking-tight">
          {location.name}
        </h3>
        <p className="text-sm text-[#676E5B] flex items-start gap-1.5 leading-snug">
          <MapPin className="w-4 h-4 text-[#7B8450] shrink-0 mt-0.5" />
          <span>{location.address}</span>
        </p>
        {location.landmark && (
          <p className="text-xs text-[#828876] pl-5.5 italic">
            Landmark: {location.landmark}
          </p>
        )}
      </div>

      {/* Capacity & Availability Progress Bar */}
      <div className="bg-[#F8F6EC] border border-[#E8E6D8] rounded-2xl p-4 mb-5 space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-[#515944] flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-[#7B8450]" />
            Live Capacity
          </span>
          <span className={isAlmostFull ? 'text-amber-700' : 'text-[#4D7C50]'}>
            {location.available_capacity} spots free ({location.current_occupied}/{location.total_capacity} occupied)
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-[#E5E5D5] h-2.5 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${
              isAlmostFull ? 'bg-amber-600' : 'bg-[#7B8450]'
            }`}
            style={{ width: `${occupancyRate}%` }}
          />
        </div>

        <div className="flex justify-between items-center text-[11px] text-[#7E8570]">
          <span>{occupancyRate}% capacity utilized</span>
          <a
            href={location.maps_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[#656E42] hover:text-[#3B4228] font-medium underline underline-offset-2"
          >
            <span>Google Maps</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Hourly Rates Grid */}
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#6B735E] mb-2.5 flex items-center gap-1">
          <Info className="w-3.5 h-3.5 text-[#7B8450]" />
          Official Hourly Tariffs
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="bg-[#FFFDF6] border border-[#E5E5D5] p-2.5 rounded-xl text-center">
            <span className="block text-[11px] text-[#777A69] font-medium flex items-center justify-center gap-1">
              <Car className="w-3 h-3" /> Car
            </span>
            <span className="text-sm font-bold text-[#30372A]">₹{location.rates.Car}/hr</span>
          </div>
          <div className="bg-[#FFFDF6] border border-[#E5E5D5] p-2.5 rounded-xl text-center">
            <span className="block text-[11px] text-[#777A69] font-medium flex items-center justify-center gap-1">
              <Bike className="w-3 h-3" /> Bike
            </span>
            <span className="text-sm font-bold text-[#30372A]">₹{location.rates.Motorcycle}/hr</span>
          </div>
          <div className="bg-[#FFFDF6] border border-[#E5E5D5] p-2.5 rounded-xl text-center">
            <span className="block text-[11px] text-[#777A69] font-medium flex items-center justify-center gap-1">
              <Bike className="w-3 h-3" /> Scooter
            </span>
            <span className="text-sm font-bold text-[#30372A]">₹{location.rates.Scooter}/hr</span>
          </div>
          <div className="bg-[#FFFDF6] border border-[#E5E5D5] p-2.5 rounded-xl text-center">
            <span className="block text-[11px] text-[#777A69] font-medium">Other</span>
            <span className="text-sm font-bold text-[#30372A]">₹{location.rates.Other}/hr</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#EAE7D8]">
        <button
          onClick={() => onSelect(location)}
          className="w-full flex items-center justify-center gap-2 bg-[#7B8450] hover:bg-[#687042] text-[#FFFDF6] py-3 px-4 rounded-xl font-semibold shadow-md transition-all hover:scale-101 active:scale-99"
        >
          <span>Select Parking</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          onClick={() => setShowQRModal(true)}
          className="w-full flex items-center justify-center gap-2 bg-[#E9EED9] hover:bg-[#DDE4C7] text-[#3B4228] border border-[#CCD6B5] py-3 px-4 rounded-xl font-semibold transition-all hover:scale-101"
        >
          <QrCode className="w-4 h-4 text-[#60693E]" />
          <span>View Standee QR</span>
        </button>
      </div>

      {/* Standee QR Code Popout Modal */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-[#FFFDF6] border border-[#E5E5D5] rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl animate-scaleUp">
            <div className="w-10 h-10 rounded-full bg-[#EBF0DC] text-[#656E42] mx-auto flex items-center justify-center">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-['Manrope'] font-bold text-xl text-[#30372A]">
                {location.name}
              </h4>
              <p className="text-xs text-[#777A69] mt-1">
                Scan this QR standee code to initiate check-in
              </p>
            </div>

            {location.qr_preview_base64 && (
              <div className="p-3 bg-white rounded-2xl border border-[#E2DFCE] inline-block shadow-inner">
                <img 
                  src={location.qr_preview_base64} 
                  alt={`${location.name} QR Code`} 
                  className="w-56 h-56 mx-auto object-contain"
                />
              </div>
            )}

            <div className="p-2.5 rounded-xl bg-[#F7F5EA] text-[11px] font-mono text-[#575E48] break-all border border-[#E4E2D3]">
              Token: {location.qr_identifier}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  setShowQRModal(false);
                  onSelect(location);
                }}
                className="flex-1 bg-[#7B8450] text-[#FFFDF6] py-2.5 rounded-xl font-semibold text-sm hover:bg-[#687042] transition-colors"
              >
                Park Here Now
              </button>
              <button
                onClick={() => setShowQRModal(false)}
                className="px-4 py-2.5 rounded-xl bg-[#E8E6D8] text-[#4B523E] text-sm font-semibold hover:bg-[#DFDCB7]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
