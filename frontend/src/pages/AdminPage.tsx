import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  BarChart3, 
  Car, 
  Clock, 
  CreditCard, 
  Download, 
  Save, 
  AlertCircle, 
  CheckCircle2, 
  QrCode, 
  Search, 
  Lock, 
  RefreshCw,
  Settings,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { 
  AdminOverviewStats, 
  ParkingLocation, 
  ParkingSession 
} from '../types';
import { 
  fetchAdminOverview, 
  updateAdminRates, 
  updateAdminCapacity, 
  getAdminQRDownloadUrl, 
  fetchParkingHistory 
} from '../services/api';

export const AdminPage: React.FC = () => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(true);
  const [adminPin, setAdminPin] = useState('');
  const [pinError, setPinError] = useState(false);

  const [stats, setStats] = useState<AdminOverviewStats | null>(null);
  const [locations, setLocations] = useState<ParkingLocation[]>([]);
  const [sessions, setSessions] = useState<ParkingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [saveErrorMsg, setSaveErrorMsg] = useState<string | null>(null);

  // Editable local state for rates
  const [editingRates, setEditingRates] = useState<Record<string, { Car: number; Motorcycle: number; Scooter: number; Other: number }>>({});
  const [editingCapacity, setEditingCapacity] = useState<Record<string, { total_capacity: number; simulated_occupied: number }>>({});

  useEffect(() => {
    if (isAdminAuthenticated) {
      loadAdminData();
    }
  }, [isAdminAuthenticated]);

  const loadAdminData = async () => {
    setLoading(true);
    setSaveSuccessMsg(null);
    setSaveErrorMsg(null);
    try {
      const [overviewData, sessionData] = await Promise.all([
        fetchAdminOverview(),
        fetchParkingHistory()
      ]);

      setStats(overviewData.stats);
      setLocations(overviewData.locations);
      setSessions(sessionData);

      // Pre-fill editable forms
      const ratesMap: any = {};
      const capMap: any = {};
      overviewData.locations.forEach((loc) => {
        ratesMap[loc.id] = { ...loc.rates };
        capMap[loc.id] = { total_capacity: loc.total_capacity, simulated_occupied: loc.current_occupied };
      });
      setEditingRates(ratesMap);
      setEditingCapacity(capMap);
    } catch (err: any) {
      setSaveErrorMsg(err.message || 'Failed to load admin data.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRates = async (locationId: string) => {
    const rateData = editingRates[locationId];
    if (!rateData) return;

    setSaveSuccessMsg(null);
    setSaveErrorMsg(null);
    try {
      await updateAdminRates(locationId, {
        rate_car: rateData.Car,
        rate_motorcycle: rateData.Motorcycle,
        rate_scooter: rateData.Scooter,
        rate_other: rateData.Other
      });
      setSaveSuccessMsg(`Rates successfully updated for ${locationId === 'loc-kambar-talav' ? 'Kambar Talav' : 'Siddheshwar Mandir'}.`);
      await loadAdminData();
    } catch (err: any) {
      setSaveErrorMsg(err.message || 'Failed to update rates.');
    }
  };

  const handleSaveCapacity = async (locationId: string) => {
    const capData = editingCapacity[locationId];
    if (!capData) return;

    setSaveSuccessMsg(null);
    setSaveErrorMsg(null);
    try {
      await updateAdminCapacity(locationId, {
        total_capacity: capData.total_capacity,
        simulated_occupied: capData.simulated_occupied
      });
      setSaveSuccessMsg(`Capacity parameters saved.`);
      await loadAdminData();
    } catch (err: any) {
      setSaveErrorMsg(err.message || 'Failed to update capacity.');
    }
  };

  const handleRateInputChange = (locId: string, category: string, value: string) => {
    const val = parseFloat(value) || 0;
    setEditingRates((prev) => ({
      ...prev,
      [locId]: {
        ...prev[locId],
        [category]: val
      }
    }));
  };

  const handleCapacityInputChange = (locId: string, field: 'total_capacity' | 'simulated_occupied', value: string) => {
    const val = parseInt(value) || 0;
    setEditingCapacity((prev) => ({
      ...prev,
      [locId]: {
        ...prev[locId],
        [field]: val
      }
    }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 animate-fadeIn">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#E5E5D5]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EBF0DC] text-xs font-bold text-[#4B552F] mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#7B8450]" />
            <span>Solapur Municipal Authority Portal</span>
          </div>
          <h1 className="font-['Manrope'] font-bold text-3xl sm:text-4xl text-[#30372A]">
            Administrative Control Center
          </h1>
          <p className="text-xs sm:text-sm text-[#6C745E]">
            Monitor revenue, adjust hourly tariffs, manage capacity, and download high-resolution QR standees.
          </p>
        </div>

        <button
          onClick={loadAdminData}
          className="flex items-center gap-2 bg-[#E9EED9] hover:bg-[#DDE4C7] text-[#3F472D] px-4 py-2.5 rounded-xl text-xs font-bold transition-colors w-fit"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Live Stats</span>
        </button>
      </div>

      {/* Messages */}
      {saveSuccessMsg && (
        <div className="p-4 rounded-2xl bg-[#EFF6E4] border border-[#CCD8B3] text-[#3C643A] text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}
      {saveErrorMsg && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{saveErrorMsg}</span>
        </div>
      )}

      {/* 1. OVERVIEW METRICS CARDS */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          
          <div className="card-elevation p-5 rounded-2xl bg-[#FFFDF6] space-y-2">
            <span className="text-xs font-semibold text-[#757D67] flex items-center gap-1">
              <Car className="w-3.5 h-3.5 text-[#7B8450]" />
              Total Sessions
            </span>
            <span className="font-['Manrope'] font-extrabold text-2xl sm:text-3xl text-[#30372A] block">
              {stats.total_sessions}
            </span>
            <span className="text-[11px] text-[#7E8670] block">
              {stats.active_sessions} Active · {stats.completed_sessions} Completed
            </span>
          </div>

          <div className="card-elevation p-5 rounded-2xl bg-[#FFFDF6] space-y-2">
            <span className="text-xs font-semibold text-[#757D67] flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#4D7C50]" />
              Active Vehicles
            </span>
            <span className="font-['Manrope'] font-extrabold text-2xl sm:text-3xl text-[#4D7C50] block">
              {stats.active_sessions}
            </span>
            <span className="text-[11px] text-[#7E8670] block">
              Parked right now
            </span>
          </div>

          <div className="card-elevation p-5 rounded-2xl bg-[#FFFDF6] space-y-2">
            <span className="text-xs font-semibold text-[#757D67] flex items-center gap-1">
              <CreditCard className="w-3.5 h-3.5 text-[#7B8450]" />
              Total Revenue
            </span>
            <span className="font-['Manrope'] font-extrabold text-2xl sm:text-3xl text-[#7B8450] block">
              ₹{stats.total_revenue.toFixed(2)}
            </span>
            <span className="text-[11px] text-[#7E8670] block">
              Municipal collections
            </span>
          </div>

          <div className="card-elevation p-5 rounded-2xl bg-[#FFFDF6] space-y-2">
            <span className="text-xs font-semibold text-[#757D67] flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#7B8450]" />
              Verified Payments
            </span>
            <span className="font-['Manrope'] font-extrabold text-2xl sm:text-3xl text-[#30372A] block">
              {stats.verified_payments}
            </span>
            <span className="text-[11px] text-[#7E8670] block">
              {stats.demo_payments} Demo · {stats.verified_payments - stats.demo_payments} Live
            </span>
          </div>

          <div className="card-elevation p-5 rounded-2xl bg-[#FFFDF6] space-y-2 col-span-2 lg:col-span-1">
            <span className="text-xs font-semibold text-[#757D67] flex items-center gap-1">
              <Settings className="w-3.5 h-3.5 text-[#7B8450]" />
              Gateway Status
            </span>
            <span className="font-bold text-sm text-[#30372A] block mt-1">
              {stats.gateway_mode}
            </span>
            <span className="text-[10px] font-semibold bg-[#EAF0DA] text-[#47522A] px-2 py-0.5 rounded-md inline-block">
              {stats.is_demo_gateway ? 'Demo Sandbox' : 'Razorpay Connected'}
            </span>
          </div>

        </div>
      )}

      {/* 2. STRICT 2-LOCATION MANAGEMENT */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-['Manrope'] font-bold text-2xl text-[#30372A]">
              Location &amp; Tariff Management
            </h2>
            <p className="text-xs text-[#6F7661]">
              Strictly restricted to the 2 designated Solapur municipal locations.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F0EDE1] text-xs font-semibold text-[#5B634E] border border-[#DDD9C5]">
            <Lock className="w-3.5 h-3.5 text-[#7B8450]" />
            <span>Addition of 3rd Location is Prohibited</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {locations.map((loc) => {
            const currentRates = editingRates[loc.id] || loc.rates;
            const currentCap = editingCapacity[loc.id] || { total_capacity: loc.total_capacity, simulated_occupied: loc.current_occupied };

            return (
              <div 
                key={loc.id}
                className="card-elevation p-6 sm:p-7 rounded-3xl bg-[#FFFDF6] border border-[#E5E5D5] space-y-6"
              >
                
                {/* Title & Info */}
                <div className="flex items-start justify-between gap-3 pb-4 border-b border-[#EAE7D8]">
                  <div>
                    <h3 className="font-['Manrope'] font-bold text-xl text-[#30372A]">
                      {loc.name}
                    </h3>
                    <p className="text-xs text-[#717865] mt-0.5">
                      {loc.address}
                    </p>
                    <span className="inline-block mt-2 font-mono text-[10px] bg-[#F2EFE3] text-[#555C46] px-2 py-0.5 rounded">
                      ID: {loc.id}
                    </span>
                  </div>

                  <a
                    href={getAdminQRDownloadUrl(loc.id)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 bg-[#E8EED8] hover:bg-[#DDE4C7] text-[#3C4427] px-3 py-2 rounded-xl text-xs font-bold transition-colors shrink-0"
                    title="Download high-res PNG for printed standee"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download QR</span>
                  </a>
                </div>

                {/* Rates Form */}
                <div className="space-y-3">
                  <span className="block text-xs font-bold text-[#4B533E] uppercase tracking-wider">
                    Configurable Hourly Rates (₹ / hour)
                  </span>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div>
                      <label className="block text-[11px] text-[#717866] font-semibold mb-1">Car</label>
                      <input
                        type="number"
                        min="1"
                        value={currentRates.Car}
                        onChange={(e) => handleRateInputChange(loc.id, 'Car', e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl border border-[#D5D2BF] bg-[#FAF8F1] text-xs font-bold text-[#30372A]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-[#717866] font-semibold mb-1">Motorcycle</label>
                      <input
                        type="number"
                        min="1"
                        value={currentRates.Motorcycle}
                        onChange={(e) => handleRateInputChange(loc.id, 'Motorcycle', e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl border border-[#D5D2BF] bg-[#FAF8F1] text-xs font-bold text-[#30372A]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-[#717866] font-semibold mb-1">Scooter</label>
                      <input
                        type="number"
                        min="1"
                        value={currentRates.Scooter}
                        onChange={(e) => handleRateInputChange(loc.id, 'Scooter', e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl border border-[#D5D2BF] bg-[#FAF8F1] text-xs font-bold text-[#30372A]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-[#717866] font-semibold mb-1">Other</label>
                      <input
                        type="number"
                        min="1"
                        value={currentRates.Other}
                        onChange={(e) => handleRateInputChange(loc.id, 'Other', e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl border border-[#D5D2BF] bg-[#FAF8F1] text-xs font-bold text-[#30372A]"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => handleSaveRates(loc.id)}
                    className="flex items-center gap-1.5 bg-[#7B8450] hover:bg-[#687042] text-[#FFFDF6] px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-all"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Rates</span>
                  </button>
                </div>

                {/* Capacity Form */}
                <div className="space-y-3 pt-3 border-t border-[#EAE7D8]">
                  <span className="block text-xs font-bold text-[#4B533E] uppercase tracking-wider">
                    Parking Capacity Parameters
                  </span>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-[#717866] font-semibold mb-1">Total Capacity</label>
                      <input
                        type="number"
                        min="1"
                        value={currentCap.total_capacity}
                        onChange={(e) => handleCapacityInputChange(loc.id, 'total_capacity', e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl border border-[#D5D2BF] bg-[#FAF8F1] text-xs font-bold text-[#30372A]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-[#717866] font-semibold mb-1">Base Demo Occupancy</label>
                      <input
                        type="number"
                        min="0"
                        value={currentCap.simulated_occupied}
                        onChange={(e) => handleCapacityInputChange(loc.id, 'simulated_occupied', e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl border border-[#D5D2BF] bg-[#FAF8F1] text-xs font-bold text-[#30372A]"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => handleSaveCapacity(loc.id)}
                    className="flex items-center gap-1.5 bg-[#E8E6D8] hover:bg-[#DCD8C8] text-[#3D4530] px-4 py-2 rounded-xl text-xs font-bold transition-all"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Capacity</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* 3. PARKING TRANSACTIONS & SESSIONS LOG */}
      <div className="space-y-4">
        <h2 className="font-['Manrope'] font-bold text-2xl text-[#30372A]">
          Parking Sessions &amp; Audit Log
        </h2>

        <div className="card-elevation rounded-2xl bg-[#FFFDF6] border border-[#E5E5D5] overflow-x-auto">
          <table className="w-full text-left text-xs text-[#30372A]">
            <thead className="bg-[#F8F6EC] text-[#555D46] uppercase font-bold text-[10px] tracking-wider border-b border-[#EAE7D8]">
              <tr>
                <th className="py-3 px-4">Ref Code</th>
                <th className="py-3 px-4">Vehicle</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Driver</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Total Fee</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE7D8]">
              {sessions.map((sess) => (
                <tr key={sess.id} className="hover:bg-[#FAF8F0]">
                  <td className="py-3 px-4 font-mono font-bold text-[#575E48]">
                    {sess.session_code}
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold">
                    {sess.vehicle_registration} ({sess.vehicle_type})
                  </td>
                  <td className="py-3 px-4 font-medium">
                    {sess.location_name}
                  </td>
                  <td className="py-3 px-4">
                    {sess.driver_name}
                  </td>
                  <td className="py-3 px-4">
                    {sess.billable_hours} hr(s)
                  </td>
                  <td className="py-3 px-4 font-bold text-[#7B8450]">
                    ₹{sess.total_amount.toFixed(2)}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        sess.status === 'ACTIVE'
                          ? 'bg-[#E5F2D9] text-[#366838]'
                          : sess.status === 'COMPLETED'
                          ? 'bg-[#F0EDE1] text-[#69705A]'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {sess.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {sess.receipt_number ? (
                      <span className="font-mono text-[10px] text-[#4D7C50] font-semibold">
                        {sess.receipt_number}
                      </span>
                    ) : (
                      <span className="text-[10px] text-[#868C79]">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
