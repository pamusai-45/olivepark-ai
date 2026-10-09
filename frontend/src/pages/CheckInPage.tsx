import React, { useState, useEffect } from 'react';
import { 
  Car, 
  Bike, 
  MapPin, 
  Clock, 
  CreditCard, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles, 
  Cpu, 
  User, 
  Phone, 
  Mail,
  ArrowRight,
  Info
} from 'lucide-react';
import { ParkingLocation, VehicleCategory, FeeBreakdown, ParkingSession } from '../types';
import { calculateParkingFee, createParkingSession } from '../services/api';
import { AIPlateScannerModal } from '../components/AIPlateScannerModal';

interface CheckInPageProps {
  selectedLocation: ParkingLocation | null;
  allLocations: ParkingLocation[];
  onLocationChange: (loc: ParkingLocation) => void;
  onProceedToPayment: (session: ParkingSession) => void;
  onBackToLocations: () => void;
}

export const CheckInPage: React.FC<CheckInPageProps> = ({
  selectedLocation,
  allLocations,
  onLocationChange,
  onProceedToPayment,
  onBackToLocations
}) => {
  const [vehicleReg, setVehicleReg] = useState('');
  const [vehicleType, setVehicleType] = useState<VehicleCategory>('Car');
  const [vehicleModel, setVehicleModel] = useState('');
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [driverEmail, setDriverEmail] = useState('');
  const [durationHours, setDurationHours] = useState<number>(2);

  const [feeBreakdown, setFeeBreakdown] = useState<FeeBreakdown | null>(null);
  const [isCalculatingFee, setIsCalculatingFee] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  // Default to first location if none selected
  const location = selectedLocation || allLocations[0];

  useEffect(() => {
    if (location && vehicleType && durationHours > 0) {
      updateFee();
    }
  }, [location?.id, vehicleType, durationHours]);

  const updateFee = async () => {
    if (!location) return;
    setIsCalculatingFee(true);
    try {
      const breakdown = await calculateParkingFee(location.id, vehicleType, durationHours);
      setFeeBreakdown(breakdown);
    } catch (err: any) {
      console.warn('Fee calculation error', err);
    } finally {
      setIsCalculatingFee(false);
    }
  };

  const handlePlateChange = (val: string) => {
    // Standardize to uppercase
    const upper = val.toUpperCase();
    setVehicleReg(upper);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!vehicleReg.trim()) {
      setErrorMessage('Please enter vehicle registration number.');
      return;
    }

    if (!driverName.trim()) {
      setErrorMessage('Please enter driver name.');
      return;
    }

    if (durationHours <= 0) {
      setErrorMessage('Please enter a parking duration of at least 1 hour.');
      return;
    }

    setIsSubmitting(true);
    try {
      const session = await createParkingSession({
        location_id: location.id,
        vehicle_registration: vehicleReg.trim(),
        vehicle_type: vehicleType,
        vehicle_model: vehicleModel.trim() || undefined,
        driver_name: driverName.trim(),
        driver_phone: driverPhone.trim() || undefined,
        driver_email: driverEmail.trim() || undefined,
        duration_hours: durationHours,
      });

      onProceedToPayment(session);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to initiate check-in session.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!location) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <p className="text-sm text-[#777A69]">No parking location selected.</p>
        <button
          onClick={onBackToLocations}
          className="bg-[#7B8450] text-[#FFFDF6] px-5 py-2.5 rounded-xl text-sm font-bold"
        >
          Select Location
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fadeIn">
      
      {/* Page Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EBF0DC] text-xs font-bold text-[#4B552F]">
          <MapPin className="w-3.5 h-3.5 text-[#7B8450]" />
          <span>Vehicle Check-In &amp; Tariff Calculator</span>
        </div>
        <h1 className="font-['Manrope'] font-bold text-3xl text-[#30372A]">
          Park Vehicle at {location.name}
        </h1>
        <p className="text-xs sm:text-sm text-[#6C745E]">
          Complete vehicle check-in details. Official tariff calculated securely on server.
        </p>
      </div>

      {/* Main Form + Live Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Vehicle Details Form (7 cols) */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-6">
          
          <div className="card-elevation p-6 sm:p-7 rounded-3xl bg-[#FFFDF6] border border-[#E5E5D5] space-y-6">
            
            {/* Selected Location Selector/Switcher */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#4A523C] uppercase tracking-wider">
                Parking Location (Solapur)
              </label>
              <select
                value={location.id}
                onChange={(e) => {
                  const found = allLocations.find((l) => l.id === e.target.value);
                  if (found) onLocationChange(found);
                }}
                className="w-full px-4 py-3 rounded-xl border border-[#D5D2BF] bg-[#FAF8F1] text-sm font-semibold text-[#30372A] focus:ring-2 focus:ring-[#7B8450] focus:outline-none"
              >
                {allLocations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Vehicle Registration Number Input & AI Trigger */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-bold text-[#4A523C] uppercase tracking-wider">
                  Vehicle Registration Number *
                </label>
                <button
                  type="button"
                  onClick={() => setIsAIModalOpen(true)}
                  className="flex items-center gap-1.5 text-xs font-bold text-[#7B8450] hover:text-[#5F673B] bg-[#EEF2E2] hover:bg-[#E2E8D3] px-3 py-1 rounded-lg transition-colors"
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span>Scan Plate with AI</span>
                </button>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={vehicleReg}
                  onChange={(e) => handlePlateChange(e.target.value)}
                  placeholder="e.g. MH 13 BN 4521"
                  required
                  className="w-full pl-4 pr-12 py-3 rounded-xl border-2 border-[#D5D2BF] bg-white font-mono font-bold text-lg text-[#30372A] tracking-wider uppercase focus:border-[#7B8450] focus:outline-none"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 bg-[#F3EFE0] text-[10px] font-bold px-2 py-0.5 rounded text-[#5D654C]">
                  IND
                </div>
              </div>
              <p className="text-[11px] text-[#7A826D]">
                Auto-normalized to uppercase. Solapur district code is MH 13.
              </p>
            </div>

            {/* Vehicle Type Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#4A523C] uppercase tracking-wider">
                Vehicle Category *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: 'Car', label: 'Car', icon: Car, rate: location.rates.Car },
                  { id: 'Motorcycle', label: 'Motorcycle', icon: Bike, rate: location.rates.Motorcycle },
                  { id: 'Scooter', label: 'Scooter', icon: Bike, rate: location.rates.Scooter },
                  { id: 'Other', label: 'Other', icon: Car, rate: location.rates.Other },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = vehicleType === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setVehicleType(item.id as VehicleCategory)}
                      className={`p-3 rounded-2xl border-2 cursor-pointer text-center transition-all ${
                        isSelected
                          ? 'border-[#7B8450] bg-[#EEF3E4] shadow-xs'
                          : 'border-[#E0DDCB] bg-[#FAF8F0] hover:bg-[#F2EFE3]'
                      }`}
                    >
                      <Icon className={`w-5 h-5 mx-auto mb-1 ${isSelected ? 'text-[#7B8450]' : 'text-[#777A69]'}`} />
                      <span className="block text-xs font-bold text-[#30372A]">{item.label}</span>
                      <span className="block text-[11px] text-[#697259] font-medium">₹{item.rate}/hr</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Vehicle Model (Optional) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#545C45]">
                Vehicle Make / Model (Optional)
              </label>
              <input
                type="text"
                value={vehicleModel}
                onChange={(e) => setVehicleModel(e.target.value)}
                placeholder="e.g. Maruti Swift / Hyundai Creta"
                className="w-full px-4 py-2.5 rounded-xl border border-[#D5D2BF] bg-[#FAF8F1] text-xs sm:text-sm text-[#30372A] focus:ring-2 focus:ring-[#7B8450] focus:outline-none"
              />
            </div>

            {/* Driver Details */}
            <div className="space-y-3 pt-2 border-t border-[#EAE7D8]">
              <span className="block text-xs font-bold text-[#4A523C] uppercase tracking-wider">
                Driver &amp; Digital Receipt Contact
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-[#545C45]">
                    Driver Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#7B8450] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={driverName}
                      onChange={(e) => setDriverName(e.target.value)}
                      placeholder="e.g. Rahul Deshmukh"
                      required
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#D5D2BF] bg-[#FAF8F1] text-xs sm:text-sm text-[#30372A] focus:ring-2 focus:ring-[#7B8450] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-[#545C45]">
                    Mobile Number (For Receipt SMS)
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[#7B8450] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={driverPhone}
                      onChange={(e) => setDriverPhone(e.target.value)}
                      placeholder="e.g. 9823012345"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#D5D2BF] bg-[#FAF8F1] text-xs sm:text-sm text-[#30372A] focus:ring-2 focus:ring-[#7B8450] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-[#545C45]">
                  Email Address (Optional for PDF Receipt copy)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#7B8450] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={driverEmail}
                    onChange={(e) => setDriverEmail(e.target.value)}
                    placeholder="e.g. rahul@example.com"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#D5D2BF] bg-[#FAF8F1] text-xs sm:text-sm text-[#30372A] focus:ring-2 focus:ring-[#7B8450] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Planned Parking Duration */}
            <div className="space-y-3 pt-2 border-t border-[#EAE7D8]">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-bold text-[#4A523C] uppercase tracking-wider">
                  Planned Parking Duration *
                </label>
                <span className="text-xs font-bold text-[#7B8450]">
                  {durationHours} Hour{durationHours > 1 ? 's' : ''}
                </span>
              </div>

              {/* Quick Duration Buttons */}
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 4, 8].map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setDurationHours(h)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all ${
                      durationHours === h
                        ? 'bg-[#7B8450] text-[#FFFDF6] shadow-sm'
                        : 'bg-[#F2EFE3] text-[#4A523C] hover:bg-[#E6E2D1]'
                    }`}
                  >
                    {h} hr{h > 1 ? 's' : ''}
                  </button>
                ))}
              </div>

              {/* Slider for custom hours */}
              <div className="space-y-1 pt-1">
                <input
                  type="range"
                  min="1"
                  max="24"
                  step="1"
                  value={durationHours}
                  onChange={(e) => setDurationHours(parseInt(e.target.value))}
                  className="w-full accent-[#7B8450] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#787F69]">
                  <span>1 hour (min)</span>
                  <span>12 hours</span>
                  <span>24 hours</span>
                </div>
              </div>
            </div>

          </div>

          {/* Inline Error Message */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 bg-[#7B8450] hover:bg-[#687042] text-[#FFFDF6] py-4 rounded-2xl font-bold text-base shadow-lg transition-all hover:scale-101 active:scale-99 disabled:opacity-50"
          >
            <span>Proceed to Payment (₹{feeBreakdown ? feeBreakdown.total_amount.toFixed(2) : '--'})</span>
            <ArrowRight className="w-4 h-4" />
          </button>

        </form>

        {/* RIGHT COLUMN: Live Fee Calculation & Policy Summary (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="card-elevation p-6 rounded-3xl bg-[#FFFDF6] border border-[#E5E5D5] space-y-5 sticky top-24">
            
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE7D8]">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#7B8450]" />
                <h3 className="font-bold text-base text-[#30372A]">
                  Parking Fee Summary
                </h3>
              </div>
              <span className="text-[10px] font-bold bg-[#E8EED8] text-[#424C27] px-2 py-0.5 rounded-full">
                Server Verified
              </span>
            </div>

            {feeBreakdown ? (
              <div className="space-y-4">
                
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-[#68705B]">
                    <span>Facility:</span>
                    <span className="font-semibold text-[#30372A]">{location.name}</span>
                  </div>
                  <div className="flex justify-between text-[#68705B]">
                    <span>Vehicle Category:</span>
                    <span className="font-semibold text-[#30372A]">{feeBreakdown.vehicle_type}</span>
                  </div>
                  <div className="flex justify-between text-[#68705B]">
                    <span>Tariff Rate:</span>
                    <span className="font-semibold text-[#30372A]">₹{feeBreakdown.hourly_rate.toFixed(2)} / hr</span>
                  </div>
                  <div className="flex justify-between text-[#68705B]">
                    <span>Requested Time:</span>
                    <span className="font-semibold text-[#30372A]">{feeBreakdown.input_duration_hours} hour(s)</span>
                  </div>
                  <div className="flex justify-between text-[#68705B]">
                    <span>Billable Units:</span>
                    <span className="font-bold text-[#30372A]">{feeBreakdown.billable_hours} started hour(s)</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#F8F6EB] text-[11px] text-[#69715A] space-y-1 border border-[#E7E4D3]">
                  <p className="font-semibold text-[#444D2F] flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 text-[#7B8450]" />
                    Billing Policy:
                  </p>
                  <p>{feeBreakdown.billing_policy}</p>
                </div>

                <div className="pt-3 border-t border-[#EAE7D8] flex justify-between items-center">
                  <div>
                    <span className="text-xs font-bold text-[#4B533E] block">Total Parking Fee</span>
                    <span className="text-[10px] text-[#7A826D]">All municipal charges included</span>
                  </div>
                  <span className="font-['Manrope'] text-3xl font-extrabold text-[#7B8450]">
                    ₹{feeBreakdown.total_amount.toFixed(2)}
                  </span>
                </div>

              </div>
            ) : (
              <div className="py-8 text-center text-xs text-[#777A69]">
                Calculating real-time fee...
              </div>
            )}

            <div className="pt-2 text-[11px] text-[#7B836E] space-y-1.5 border-t border-[#EAE7D8]">
              <p className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#4D7C50]" />
                Prevents duplicate active sessions for same vehicle
              </p>
              <p className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#4D7C50]" />
                Official digital PDF pass generated immediately
              </p>
            </div>

          </div>

        </div>

      </div>

      {/* AI Number Plate Recognition Modal */}
      <AIPlateScannerModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        onPlateSelected={(plate) => handlePlateChange(plate)}
      />

    </div>
  );
};
