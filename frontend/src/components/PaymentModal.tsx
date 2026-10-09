import React, { useState, useEffect } from 'react';
import { 
  X, 
  CreditCard, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Clock, 
  Car, 
  Sparkles,
  Lock
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { createPaymentOrder, verifyPayment } from '../services/api';
import { ParkingSession, PaymentOrder, ReceiptData } from '../types';

interface PaymentModalProps {
  isOpen: boolean;
  session: ParkingSession;
  onClose: () => void;
  onPaymentSuccess: (receipt: ReceiptData) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  session,
  onClose,
  onPaymentSuccess
}) => {
  const [order, setOrder] = useState<PaymentOrder | null>(null);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [paymentMode, setPaymentMode] = useState<'DEMO' | 'RAZORPAY_TEST'>('DEMO');

  useEffect(() => {
    if (isOpen && session) {
      initiateOrder();
    }
  }, [isOpen, session]);

  const initiateOrder = async () => {
    setLoadingOrder(true);
    setErrorMsg(null);
    try {
      const ord = await createPaymentOrder(session.id);
      setOrder(ord);
      setPaymentMode(ord.gateway_mode);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to initialize payment order.');
    } finally {
      setLoadingOrder(false);
    }
  };

  const handleSimulateDemoPayment = async () => {
    if (!order) return;
    setIsProcessing(true);
    setErrorMsg(null);

    try {
      // Simulate slight processing latency for realistic UX
      await new Promise((res) => setTimeout(res, 800));

      const receipt = await verifyPayment({
        order_id: order.order_id,
        payment_id: `pay_demo_${Date.now()}`
      });

      // Confetti burst on successful verification
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });

      onPaymentSuccess(receipt);
    } catch (err: any) {
      setErrorMsg(err.message || 'Payment verification failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRazorpayTestPayment = async () => {
    if (!order) return;
    
    // Check if Razorpay SDK script is loaded
    if (!(window as any).Razorpay) {
      // Fallback if script not loaded
      setErrorMsg('Razorpay SDK not loaded in test environment. Proceeding with verified Demo Payment.');
      handleSimulateDemoPayment();
      return;
    }

    try {
      const options = {
        key: order.key_id,
        amount: Math.round(order.amount * 100),
        currency: 'INR',
        name: 'OlivePark AI — Solapur',
        description: `Parking: ${session.vehicle_registration} at ${session.location_name}`,
        order_id: order.order_id,
        handler: async (response: any) => {
          setIsProcessing(true);
          try {
            const receipt = await verifyPayment({
              order_id: response.razorpay_order_id,
              payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            confetti({
              particleCount: 90,
              spread: 70,
              origin: { y: 0.6 }
            });

            onPaymentSuccess(receipt);
          } catch (e: any) {
            setErrorMsg(e.message || 'Server verification failed.');
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: {
          name: session.driver_name,
          contact: session.driver_phone || '',
          email: session.driver_email || ''
        },
        theme: {
          color: '#7B8450'
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (e: any) {
      setErrorMsg(`Razorpay initiation error: ${e.message}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fadeIn">
      <div className="bg-[#FFFDF6] border border-[#E5E5D5] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#EAE7D8]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#7B8450] text-[#FFFDF6] flex items-center justify-center shadow-sm">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-['Manrope'] font-bold text-xl text-[#30372A]">
                Secure Parking Checkout
              </h3>
              <p className="text-xs text-[#777A69]">
                OlivePark AI · Solapur Smart City Gateway
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-[#777A69] hover:text-[#30372A] hover:bg-[#F2EFE0]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="py-5 space-y-5">
          
          {/* Order Details Summary Box */}
          <div className="bg-[#FAF8F0] border border-[#E5E2D2] rounded-2xl p-5 space-y-3">
            <div className="flex justify-between items-center pb-2.5 border-b border-[#EAE6D6] text-xs">
              <span className="text-[#6D755F] font-semibold">Location:</span>
              <span className="text-[#30372A] font-bold">{session.location_name}</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[#6D755F] block">Vehicle No:</span>
                <span className="text-[#30372A] font-bold font-mono text-sm">{session.vehicle_registration}</span>
              </div>
              <div>
                <span className="text-[#6D755F] block">Vehicle Type:</span>
                <span className="text-[#30372A] font-semibold">{session.vehicle_type}</span>
              </div>
              <div>
                <span className="text-[#6D755F] block">Driver:</span>
                <span className="text-[#30372A] font-medium">{session.driver_name}</span>
              </div>
              <div>
                <span className="text-[#6D755F] block">Duration Billed:</span>
                <span className="text-[#30372A] font-semibold">{session.billable_hours} hr(s) (@ ₹{session.hourly_rate}/hr)</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-[#EAE6D6]">
              <div>
                <span className="text-xs font-semibold text-[#6D755F] block">Total Amount to Pay</span>
                <span className="text-[11px] text-[#868C77]">Inclusive of municipal parking fees</span>
              </div>
              <div className="text-right">
                <span className="font-['Manrope'] text-3xl font-extrabold text-[#7B8450]">
                  ₹{session.total_amount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Mode Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[#515942]">
              Select Payment Processing Gateway:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div 
                onClick={() => setPaymentMode('DEMO')}
                className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                  paymentMode === 'DEMO'
                    ? 'border-[#7B8450] bg-[#F1F6E7]'
                    : 'border-[#E0DDCB] bg-[#FFFDF6] hover:bg-[#F9F7EF]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-[#30372A] flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-[#7B8450]" />
                    Demo Payment Mode
                  </span>
                  {paymentMode === 'DEMO' && (
                    <CheckCircle2 className="w-4 h-4 text-[#7B8450]" />
                  )}
                </div>
                <p className="text-[11px] text-[#6D745F]">
                  Instant simulation. Verified server-side without real cards.
                </p>
              </div>

              <div 
                onClick={() => setPaymentMode('RAZORPAY_TEST')}
                className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                  paymentMode === 'RAZORPAY_TEST'
                    ? 'border-[#7B8450] bg-[#F1F6E7]'
                    : 'border-[#E0DDCB] bg-[#FFFDF6] hover:bg-[#F9F7EF]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-[#30372A] flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#7B8450]" />
                    Razorpay Testnet
                  </span>
                  {paymentMode === 'RAZORPAY_TEST' && (
                    <CheckCircle2 className="w-4 h-4 text-[#7B8450]" />
                  )}
                </div>
                <p className="text-[11px] text-[#6D745F]">
                  Requires test credentials in .env. Real sandbox modal.
                </p>
              </div>
            </div>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Security & Verification Guarantee */}
          <div className="flex items-center gap-2 text-[11px] text-[#717866] justify-center">
            <Lock className="w-3.5 h-3.5 text-[#7B8450]" />
            <span>256-bit Encrypted · Idempotent Transaction · Official Solapur Municipal Receipt</span>
          </div>

          {/* Action CTA Button */}
          <div>
            <button
              onClick={() => {
                if (paymentMode === 'DEMO') {
                  handleSimulateDemoPayment();
                } else {
                  handleRazorpayTestPayment();
                }
              }}
              disabled={loadingOrder || isProcessing}
              className="w-full flex items-center justify-center gap-2 bg-[#7B8450] hover:bg-[#687042] text-[#FFFDF6] py-4 rounded-2xl font-bold text-base shadow-lg transition-all hover:scale-101 active:scale-99 disabled:opacity-60"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Verifying Payment Signature...</span>
                </>
              ) : loadingOrder ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Generating Order Token...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  <span>Pay ₹{session.total_amount.toFixed(2)} &amp; Issue Receipt</span>
                </>
              )}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
