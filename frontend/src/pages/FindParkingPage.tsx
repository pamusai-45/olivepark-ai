import React, { useState } from 'react';
import { MapPin, Search, Sparkles, Filter, Navigation } from 'lucide-react';
import { ParkingLocation } from '../types';
import { LocationCard } from '../components/LocationCard';

interface FindParkingPageProps {
  locations: ParkingLocation[];
  onSelectLocation: (loc: ParkingLocation) => void;
  onOpenQR: (loc?: ParkingLocation) => void;
}

export const FindParkingPage: React.FC<FindParkingPageProps> = ({
  locations,
  onSelectLocation,
  onOpenQR
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLocations = locations.filter((loc) =>
    loc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    loc.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 animate-fadeIn">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#E5E5D5]">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EBF0DC] text-xs font-bold text-[#4B552F]">
            <MapPin className="w-3.5 h-3.5 text-[#7B8450]" />
            <span>Solapur Municipal Jurisdiction</span>
          </div>
          <h1 className="font-['Manrope'] font-bold text-3xl sm:text-4xl text-[#30372A]">
            Find Parking in Solapur
          </h1>
          <p className="text-sm text-[#6C735F] max-w-xl">
            Choose an official parking facility. Availability and tariffs are tracked in real-time.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#7B8450] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Kambar Talav or Siddheshwar..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#D8D5C2] bg-[#FFFDF6] text-xs sm:text-sm text-[#30372A] focus:outline-none focus:ring-2 focus:ring-[#7B8450]"
          />
        </div>
      </div>

      {/* Strict 2-Location Policy Banner */}
      <div className="p-4 rounded-2xl bg-[#F4F1E4] border border-[#DDD9C5] flex items-center justify-between text-xs text-[#525A44]">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#7B8450] shrink-0" />
          <span>
            <b>Official Solapur System Notice:</b> OlivePark AI is strictly configured for <b>Kambar Talav</b> and <b>Siddheshwar Mandir</b> only.
          </span>
        </div>
        <span className="hidden sm:inline-block font-semibold bg-[#E4E0CE] px-2.5 py-1 rounded-lg text-[11px]">
          2 Locations Configured
        </span>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filteredLocations.map((loc) => (
          <LocationCard
            key={loc.id}
            location={loc}
            onSelect={onSelectLocation}
            onOpenQR={onOpenQR}
          />
        ))}
      </div>

      {filteredLocations.length === 0 && (
        <div className="text-center py-12 space-y-3 bg-[#FFFDF6] rounded-2xl border border-[#E5E5D5] p-8">
          <p className="text-sm text-[#777A69]">No location matching "{searchTerm}".</p>
          <button
            onClick={() => setSearchTerm('')}
            className="text-xs font-bold text-[#7B8450] underline"
          >
            Show All 2 Solapur Locations
          </button>
        </div>
      )}

    </div>
  );
};
