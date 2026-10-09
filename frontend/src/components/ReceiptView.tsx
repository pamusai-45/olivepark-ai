import React, { useState } from 'react';
import { 
  Download, 
  Printer, 
  Share2, 
  CheckCircle2, 
  ArrowLeft, 
  ShieldCheck, 
  Car, 
  MapPin, 
  Clock, 
  QrCode,
  Copy,
  Check
} from 'lucide-react';
import { ReceiptData } from '../types';
import { getReceiptPdfDownloadUrl } from '../services/api';

interface ReceiptViewProps {
  receipt: ReceiptData;
  onBackToHistory: () => void;
  onNewBooking: () => void;
}

export const ReceiptView: React.FC<ReceiptViewProps> = ({
  receipt,
  onBackToHistory,
  onNewBooking
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const session = receipt.session;
  const payment = receipt.payment;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    const url = getReceiptPdfDownloadUrl(receipt.id);
    window.open(url, '_blank');
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}?verify=${receipt.receipt_number}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `OlivePark AI Receipt - ${receipt.receipt_number}`,
          text: `Official Parking Receipt for ${session.vehicle_registration} at ${session.location_name}`,
          url: shareUrl,
        });
        return;
      } catch (err) {
        // Fallback to copy
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch (err) {
      console.warn('Copy failed', err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6 animate-fadeIn">
      
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2">
        <button
          onClick={onBackToHistory}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#5B634E] hover:text-[#30372A] bg-[#EFECE1] hover:bg-[#E4E1D4] px-3.5 py-2 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Parking History</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadPdf}
            className="flex items-center gap-1.5 bg-[#7B8450] hover:bg-[#687042] text-[#FFFDF6] px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-all hover:scale-102"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 bg-[#E8E6D8] hover:bg-[#DCD8C8] text-[#3F4733] px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 bg-[#E8E6D8] hover:bg-[#DCD8C8] text-[#3F4733] px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors"
            title="Share Verification Link"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-[#4D7C50]" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Copied' : 'Share'}</span>
          </button>
        </div>
      </div>

      {/* Main Printable Receipt Card */}
      <div className="bg-[#FFFDF6] border border-[#E5E5D5] rounded-3xl p-6 sm:p-10 shadow-xl space-y-6 print:shadow-none print:border-none print:p-0">
        
        {/* Header Branding */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-[#EAE7D8] gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#7B8450] text-[#FFFDF6] flex items-center justify-center shadow-md">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-['Manrope'] font-black text-2xl text-[#30372A]">
                  OlivePark <span className="text-[#7B8450]">AI</span>
                </span>
                <span className="text-[10px] font-bold bg-[#DDE4C7] text-[#444C2B] px-2 py-0.5 rounded-full">
                  Official Pass
                </span>
              </div>
              <p className="text-xs text-[#717865]">
                Smart Parking · Solapur Municipal System
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4D7C50] bg-[#EFF6E4] border border-[#CFE0BA] px-3 py-1 rounded-full mb-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              PAID &amp; VERIFIED
            </span>
            <p className="font-mono text-xs text-[#525A44] font-bold">
              {receipt.receipt_number}
            </p>
            <p className="text-[11px] text-[#7F8672]">
              Issued: {receipt.issued_at ? new Date(receipt.issued_at).toLocaleString('en-IN') : 'Just Now'}
            </p>
          </div>
        </div>

        {/* Location & Vehicle Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#F8F6EB] p-5 rounded-2xl border border-[#E8E5D5]">
          <div className="space-y-1">
            <span className="text-[11px] uppercase font-bold text-[#727B64] flex items-center gap-1">
              <MapPin className="w-3 h-3 text-[#7B8450]" />
              Parking Facility
            </span>
            <h4 className="font-bold text-base text-[#30372A]">
              {session.location_name}
            </h4>
            <p className="text-xs text-[#69725B]">
              Solapur Municipal Smart Parking Zone
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] uppercase font-bold text-[#727B64] flex items-center gap-1">
              <Car className="w-3 h-3 text-[#7B8450]" />
              Vehicle &amp; Driver
            </span>
            <h4 className="font-bold text-base font-mono text-[#30372A]">
              {session.vehicle_registration} ({session.vehicle_type})
            </h4>
            <p className="text-xs text-[#69725B]">
              Driver: {session.driver_name} {session.driver_phone ? `· ${session.driver_phone}` : ''}
            </p>
          </div>
        </div>

        {/* Parking Session Timeline */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs py-2">
          <div className="p-3.5 rounded-xl bg-[#FAF8F1] border border-[#E7E4D4]">
            <span className="text-[#737C66] block text-[11px] font-semibold">Entry Timestamp:</span>
            <span className="text-[#30372A] font-bold text-sm">
              {session.start_time ? new Date(session.start_time).toLocaleString('en-IN') : 'Active'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FAF8F1] border border-[#E7E4D4]">
            <span className="text-[#737C66] block text-[11px] font-semibold">Valid Until Expected Exit:</span>
            <span className="text-[#30372A] font-bold text-sm">
              {session.expected_exit_time ? new Date(session.expected_exit_time).toLocaleString('en-IN') : 'N/A'}
            </span>
          </div>
        </div>

        {/* Itemized Price Table */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold text-[#555C47] pb-2 border-b border-[#EAE7D8]">
            <span>Fee Breakdown</span>
            <span>Amount (INR)</span>
          </div>

          <div className="flex justify-between text-xs text-[#30372A] py-1.5">
            <div>
              <p className="font-semibold">{session.vehicle_type} Parking Tariff</p>
              <p className="text-[11px] text-[#787F6A]">
                {session.billable_hours} billable hr(s) @ ₹{session.hourly_rate}/hr
              </p>
            </div>
            <span className="font-bold">₹{session.total_amount.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-xs text-[#787F6A] py-1">
            <span>Municipal Cess / Smart City Surcharge</span>
            <span>₹0.00</span>
          </div>

          <div className="flex justify-between items-center pt-3 border-t-2 border-[#7B8450] text-[#30372A]">
            <div>
              <span className="font-bold text-sm">TOTAL AMOUNT PAID</span>
              <p className="text-[10px] text-[#7A826D]">
                Payment Mode: {payment?.gateway_mode || 'DEMO'} (Ref: {payment?.payment_id || 'DEMO_PAID'})
              </p>
            </div>
            <span className="font-['Manrope'] text-2xl font-black text-[#7B8450]">
              ₹{session.total_amount.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Verification Footer with Security Token */}
        <div className="p-4 rounded-2xl bg-[#F6F4EB] border border-[#E3E0D1] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-xs font-bold text-[#4B533E] flex items-center gap-1.5 justify-center sm:justify-start">
              <ShieldCheck className="w-4 h-4 text-[#7B8450]" />
              Digital Verification Code
            </span>
            <p className="font-mono text-xs text-[#636C55] font-semibold break-all">
              {receipt.verification_token}
            </p>
            <p className="text-[10px] text-[#848B77]">
              Session Reference: {session.session_code}
            </p>
          </div>

          <div className="p-2 bg-white rounded-xl border border-[#DCD9C9] shrink-0">
            {/* Embedded QR code placeholder / SVG */}
            <div className="w-20 h-20 flex flex-col items-center justify-center bg-[#F7F5EA] text-[#7B8450] rounded-lg">
              <QrCode className="w-12 h-12" />
              <span className="text-[8px] font-bold mt-0.5">VERIFIED</span>
            </div>
          </div>
        </div>

        {/* Footer Notice */}
        <p className="text-[11px] text-[#868C78] text-center italic">
          Keep this receipt accessible on your mobile or dashboard until vehicle exit. 
          For assistance at Kambar Talav or Siddheshwar Mandir, contact Solapur Smart Parking Desk.
        </p>

      </div>

      {/* Post-receipt CTA */}
      <div className="text-center pt-2">
        <button
          onClick={onNewBooking}
          className="text-xs font-semibold text-[#7B8450] hover:text-[#586036] underline underline-offset-4"
        >
          Book Another Parking Spot at Solapur
        </button>
      </div>

    </div>
  );
};
