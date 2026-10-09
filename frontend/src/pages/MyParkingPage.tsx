import React, { useState, useEffect } from 'react';
import { 
  Car, 
  MapPin, 
  Clock, 
  FileText, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Download, 
  LogOut, 
  CreditCard,
  Sparkles
} from 'lucide-react';
import { ParkingSession, ReceiptData } from '../types';
import { fetchParkingHistory, completeParkingSession, fetchReceipt, getReceiptPdfDownloadUrl } from '../services/api';

interface MyParkingPageProps {
  onViewReceipt: (receipt: ReceiptData) => void;
  onNewBooking: () => void;
}

export const MyParkingPage: React.FC<MyParkingPageProps> = ({
  onViewReceipt,
  onNewBooking
}) => {
  const [sessions, setSessions] = useState<ParkingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  useEffect(() => {
    loadSessions();
  }, [vehicleSearch, statusFilter]);

  const loadSessions = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const filter = statusFilter === 'ALL' ? undefined : statusFilter;
      const data = await fetchParkingHistory(vehicleSearch.trim() || undefined, filter);
      setSessions(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load parking history.');
    } finally {
      setLoading(false);
    }
  };

  const handleEndSession = async (sessionId: string) => {
    setActionLoadingId(sessionId);
    try {
      await completeParkingSession(sessionId);
      await loadSessions();
    } catch (err: any) {
      alert(err.message || 'Failed to complete session.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleOpenReceipt = async (receiptId: string) => {
    setActionLoadingId(receiptId);
    try {
      const receipt = await fetchReceipt(receiptId);
      onViewReceipt(receipt);
    } catch (err: any) {
      alert(err.message || 'Failed to fetch receipt details.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const activeSessions = sessions.filter((s) => s.status === 'ACTIVE');
  const pastSessions = sessions.filter((s) => s.status !== 'ACTIVE');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fadeIn">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#E5E5D5]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EBF0DC] text-xs font-bold text-[#47522C] mb-1">
            <Clock className="w-3.5 h-3.5 text-[#7B8450]" />
            <span>Persisted Database Records</span>
          </div>
          <h1 className="font-['Manrope'] font-bold text-3xl text-[#30372A]">
            My Parking Sessions
          </h1>
          <p className="text-xs sm:text-sm text-[#6A715C]">
            View active parking, exit sessions, and download official municipal receipts.
          </p>
        </div>

        <button
          onClick={onNewBooking}
          className="bg-[#7B8450] hover:bg-[#687042] text-[#FFFDF6] px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all"
        >
          Park Another Vehicle
        </button>
      </div>

      {/* Search & Status Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        
        {/* Status Tabs */}
        <div className="flex p-1 bg-[#EFECE1] rounded-xl text-xs font-bold text-[#555D46] w-full sm:w-auto">
          {['ALL', 'ACTIVE', 'COMPLETED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg transition-all ${
                statusFilter === st
                  ? 'bg-[#FFFDF6] text-[#30372A] shadow-xs'
                  : 'hover:text-[#30372A]'
              }`}
            >
              {st === 'ALL' ? 'All Sessions' : st === 'ACTIVE' ? 'Active Now' : 'Completed'}
            </button>
          ))}
        </div>

        {/* Vehicle Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-[#7B8450] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={vehicleSearch}
            onChange={(e) => setVehicleSearch(e.target.value)}
            placeholder="Filter by vehicle no (e.g. MH 13)..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#D5D2BF] bg-[#FFFDF6] text-xs sm:text-sm text-[#30372A] focus:outline-none focus:ring-2 focus:ring-[#7B8450]"
          />
        </div>

      </div>

      {/* Error Message */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="py-16 text-center text-xs font-semibold text-[#7B8450] flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>Fetching sessions from database...</span>
        </div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-16 bg-[#FFFDF6] border border-[#E5E5D5] rounded-3xl p-8 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#EEF2E2] text-[#7B8450] mx-auto flex items-center justify-center">
            <Car className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-base text-[#30372A]">No Parking Records Found</h4>
            <p className="text-xs text-[#777A69]">
              {vehicleSearch
                ? `No sessions found matching "${vehicleSearch}".`
                : 'You have not parked a vehicle at Kambar Talav or Siddheshwar Mandir yet.'}
            </p>
          </div>
          <button
            onClick={onNewBooking}
            className="bg-[#7B8450] text-[#FFFDF6] px-5 py-2.5 rounded-xl text-xs font-bold"
          >
            Start Parking Check-In
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          
          {sessions.map((sess) => {
            const isActive = sess.status === 'ACTIVE';
            return (
              <div
                key={sess.id}
                className={`card-elevation rounded-2xl p-5 sm:p-6 bg-[#FFFDF6] border ${
                  isActive ? 'border-[#7B8450] ring-2 ring-[#7B8450]/15' : 'border-[#E5E5D5]'
                } flex flex-col md:flex-row md:items-center justify-between gap-5 transition-all`}
              >
                
                {/* Left: Info */}
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-bold text-base text-[#30372A] bg-[#F4F1E4] px-2.5 py-0.5 rounded-lg border border-[#DDD9C5]">
                      {sess.vehicle_registration}
                    </span>
                    <span className="text-xs font-semibold text-[#5B634E] bg-[#EEF2E2] px-2.5 py-0.5 rounded-md">
                      {sess.vehicle_type}
                    </span>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                        isActive
                          ? 'bg-[#E5F2D9] text-[#366838]'
                          : sess.status === 'COMPLETED'
                          ? 'bg-[#F0EDE1] text-[#69705A]'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#4D7C50] animate-pulse"></span>}
                      {sess.status}
                    </span>
                    <span className="text-[11px] text-[#7F8673] font-mono">
                      Ref: {sess.session_code}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h4 className="font-bold text-base text-[#30372A] flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-[#7B8450] shrink-0" />
                      <span>{sess.location_name}</span>
                    </h4>
                    <p className="text-xs text-[#6B735D]">
                      Driver: {sess.driver_name} {sess.driver_phone ? `· ${sess.driver_phone}` : ''}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-[#747B65]">
                    <span>
                      <b>Entry:</b> {sess.start_time ? new Date(sess.start_time).toLocaleString('en-IN') : 'N/A'}
                    </span>
                    <span>
                      <b>Valid Until:</b> {sess.expected_exit_time ? new Date(sess.expected_exit_time).toLocaleString('en-IN') : 'N/A'}
                    </span>
                    {sess.actual_exit_time && (
                      <span className="text-[#4D7C50]">
                        <b>Exited:</b> {new Date(sess.actual_exit_time).toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Right: Tariff & Actions */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-3 sm:pt-0 border-[#EAE7D8] gap-3">
                  <div className="text-left sm:text-right">
                    <span className="text-[11px] text-[#787F68] block">Total Paid</span>
                    <span className="font-['Manrope'] font-extrabold text-2xl text-[#7B8450]">
                      ₹{sess.total_amount.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-[#7F8672] block">
                      {sess.billable_hours} hr(s) billed
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* View/Download Receipt */}
                    {sess.receipt_id && (
                      <button
                        onClick={() => handleOpenReceipt(sess.receipt_id!)}
                        disabled={actionLoadingId === sess.receipt_id}
                        className="flex items-center gap-1.5 bg-[#E8EED8] hover:bg-[#DDE4C7] text-[#3B4426] px-3.5 py-2 rounded-xl text-xs font-bold transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5 text-[#7B8450]" />
                        <span>Receipt</span>
                      </button>
                    )}

                    {/* Exit/End Parking Button for Active */}
                    {isActive && (
                      <button
                        onClick={() => handleEndSession(sess.id)}
                        disabled={actionLoadingId === sess.id}
                        className="flex items-center gap-1.5 bg-[#7B8450] hover:bg-[#687042] text-[#FFFDF6] px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-all"
                      >
                        {actionLoadingId === sess.id ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <LogOut className="w-3.5 h-3.5" />
                        )}
                        <span>End Session</span>
                      </button>
                    )}
                  </div>

                </div>

              </div>
            );
          })}

        </div>
      )}

    </div>
  );
};
