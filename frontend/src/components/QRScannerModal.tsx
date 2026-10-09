import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Camera, 
  QrCode, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  RefreshCw,
  Keyboard
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { validateQRCode, fetchDemoQRTokens } from '../services/api';
import { ParkingLocation, DemoQRToken } from '../types';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (location: ParkingLocation) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess 
}) => {
  const [activeMode, setActiveMode] = useState<'camera' | 'demo' | 'manual'>('demo');
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualInput, setManualInput] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [confirmedLocation, setConfirmedLocation] = useState<ParkingLocation | null>(null);
  const [demoTokens, setDemoTokens] = useState<DemoQRToken[]>([]);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'qr-reader-container';

  useEffect(() => {
    if (isOpen) {
      loadDemoTokens();
    } else {
      stopCameraScanner();
      setConfirmedLocation(null);
      setValidationError(null);
    }
    return () => {
      stopCameraScanner();
    };
  }, [isOpen]);

  const loadDemoTokens = async () => {
    try {
      const tokens = await fetchDemoQRTokens();
      setDemoTokens(tokens);
    } catch (err) {
      console.error('Failed to load demo tokens', err);
    }
  };

  const startCameraScanner = async () => {
    setCameraError(null);
    setValidationError(null);
    try {
      const html5QrCode = new Html5Qrcode(scannerContainerId);
      scannerRef.current = html5QrCode;

      const cameras = await Html5Qrcode.getCameras();
      if (!cameras || cameras.length === 0) {
        setCameraError('No camera detected on this device. Please use Demo QR or manual input.');
        return;
      }

      const cameraId = cameras[cameras.length - 1].id; // Back camera on mobile

      await html5QrCode.start(
        cameraId,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        async (decodedText) => {
          await handleScannedText(decodedText);
          stopCameraScanner();
        },
        () => {
          // Frame scan error - ignore to prevent spam
        }
      );
      setIsScanning(true);
    } catch (err: any) {
      console.warn('Camera start error', err);
      setCameraError(
        err?.message?.includes('Permission') 
          ? 'Camera permission denied. Please allow camera access or use the Demo QR buttons.'
          : 'Unable to start camera stream. You can test immediately using the 1-Click Demo QR Standees.'
      );
      setIsScanning(false);
    }
  };

  const stopCameraScanner = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (err) {
        console.warn('Error stopping scanner', err);
      }
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  const handleScannedText = async (qrString: string) => {
    setIsValidating(true);
    setValidationError(null);
    try {
      const result = await validateQRCode(qrString);
      if (result.is_valid && result.location) {
        setConfirmedLocation(result.location);
      } else {
        setValidationError('Invalid or unrecognized parking QR code.');
      }
    } catch (err: any) {
      setValidationError(err?.message || 'Invalid QR code. Please scan a valid OlivePark Solapur standee.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    handleScannedText(manualInput.trim());
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fadeIn">
      <div className="bg-[#FFFDF6] border border-[#E5E5D5] rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#EAE7D8]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#7B8450] text-[#FFFDF6] flex items-center justify-center shadow-sm">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-['Manrope'] font-bold text-xl text-[#30372A]">
                Scan Parking QR Code
              </h3>
              <p className="text-xs text-[#777A69]">
                Locate the OlivePark standee at Kambar Talav or Siddheshwar Mandir
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-[#777A69] hover:text-[#30372A] hover:bg-[#F2EFE0] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Confirmed Location Prompt */}
        {confirmedLocation ? (
          <div className="py-6 space-y-5 animate-scaleUp">
            <div className="p-5 rounded-2xl bg-[#F0F5E5] border border-[#D1E0B8] space-y-3">
              <div className="flex items-center gap-2 text-[#4D7C50] font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-[#4D7C50]" />
                <span>Verified Solapur Parking Facility</span>
              </div>
              <div>
                <h4 className="font-['Manrope'] font-extrabold text-2xl text-[#30372A]">
                  {confirmedLocation.name}
                </h4>
                <p className="text-xs text-[#5D664E] mt-0.5">
                  {confirmedLocation.address}
                </p>
                {confirmedLocation.zone_name && (
                  <span className="inline-block mt-2 text-xs font-semibold px-2.5 py-0.5 rounded-md bg-[#DDE4C7] text-[#3D4525]">
                    Zone: {confirmedLocation.zone_name}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#DFE8C9] text-xs">
                <div>
                  <span className="text-[#727B64]">Car Hourly Rate:</span>
                  <span className="font-bold text-[#30372A] ml-1.5">₹{confirmedLocation.rates.Car}/hr</span>
                </div>
                <div>
                  <span className="text-[#727B64]">Bike Hourly Rate:</span>
                  <span className="font-bold text-[#30372A] ml-1.5">₹{confirmedLocation.rates.Motorcycle}/hr</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-[#777A69] text-center italic">
              Verified by OlivePark AI Municipal Gateway. Rates retrieved from secure backend.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  onSuccess(confirmedLocation);
                  onClose();
                }}
                className="flex-1 flex items-center justify-center gap-2 bg-[#7B8450] hover:bg-[#687042] text-[#FFFDF6] py-3.5 px-4 rounded-xl font-bold shadow-md transition-all hover:scale-101"
              >
                <span>Confirm &amp; Enter Vehicle Details</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setConfirmedLocation(null)}
                className="px-4 py-3.5 rounded-xl bg-[#EFECE0] text-[#4F573F] font-semibold text-sm hover:bg-[#E2DFC9]"
              >
                Scan Another
              </button>
            </div>
          </div>
        ) : (
          <div className="py-4 space-y-4">
            {/* Mode Selector Tabs */}
            <div className="flex p-1 bg-[#F0EDE0] rounded-xl text-xs font-semibold text-[#5A6348]">
              <button
                onClick={() => {
                  stopCameraScanner();
                  setActiveMode('demo');
                }}
                className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  activeMode === 'demo' ? 'bg-[#FFFDF6] text-[#30372A] shadow-sm' : 'hover:text-[#30372A]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#7B8450]" />
                1-Click Demo QR
              </button>
              <button
                onClick={() => {
                  setActiveMode('camera');
                  startCameraScanner();
                }}
                className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  activeMode === 'camera' ? 'bg-[#FFFDF6] text-[#30372A] shadow-sm' : 'hover:text-[#30372A]'
                }`}
              >
                <Camera className="w-3.5 h-3.5 text-[#7B8450]" />
                Device Camera
              </button>
              <button
                onClick={() => {
                  stopCameraScanner();
                  setActiveMode('manual');
                }}
                className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  activeMode === 'manual' ? 'bg-[#FFFDF6] text-[#30372A] shadow-sm' : 'hover:text-[#30372A]'
                }`}
              >
                <Keyboard className="w-3.5 h-3.5 text-[#7B8450]" />
                Manual Code
              </button>
            </div>

            {/* Error Message */}
            {validationError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            {/* TAB 1: 1-Click Demo QR Codes */}
            {activeMode === 'demo' && (
              <div className="space-y-3">
                <p className="text-xs text-[#6C745E]">
                  Select either of the 2 authorized Solapur parking locations below to simulate scanning a real standee:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {demoTokens.map((t) => (
                    <div
                      key={t.location_id}
                      onClick={() => handleScannedText(t.token)}
                      className="p-4 rounded-2xl bg-[#FAF8F0] border-2 border-[#E2DFC9] hover:border-[#7B8450] hover:bg-[#F2F6E8] cursor-pointer transition-all group text-left"
                    >
                      <div className="flex items-center gap-3">
                        <img 
                          src={t.qr_image_base64} 
                          alt={t.name}
                          className="w-16 h-16 rounded-xl border border-[#D5D2BF] bg-white p-1"
                        />
                        <div className="flex-1 min-w-0">
                          <h5 className="font-bold text-sm text-[#30372A] group-hover:text-[#7B8450] truncate">
                            {t.name}
                          </h5>
                          <p className="text-[11px] text-[#717865] truncate mt-0.5">
                            {t.zone}
                          </p>
                          <span className="inline-block mt-1 text-[10px] font-semibold text-[#5B663C] bg-[#E3EACC] px-2 py-0.5 rounded">
                            Tap to Scan Standee
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: Device Camera Scan */}
            {activeMode === 'camera' && (
              <div className="space-y-3 text-center">
                {cameraError ? (
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs space-y-2">
                    <p>{cameraError}</p>
                    <button
                      onClick={() => {
                        setActiveMode('demo');
                      }}
                      className="text-xs font-bold underline text-[#7B8450]"
                    >
                      Switch to 1-Click Demo Standees
                    </button>
                  </div>
                ) : (
                  <div className="relative mx-auto rounded-2xl overflow-hidden border-2 border-dashed border-[#7B8450] bg-black max-w-sm">
                    <div id={scannerContainerId} className="w-full h-64"></div>
                    <p className="text-[11px] text-[#F7F5EA] bg-black/70 py-1.5 px-3 absolute bottom-0 left-0 right-0">
                      Point camera at OlivePark standee QR
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: Manual Text Input */}
            {activeMode === 'manual' && (
              <form onSubmit={handleManualSubmit} className="space-y-3">
                <label className="block text-xs font-semibold text-[#4F5740]">
                  Enter Standee Token or Location Key:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    placeholder="e.g. OLIVEPARK:SOLAPUR:KAMBAR_TALAV:Z1"
                    className="flex-1 px-4 py-2.5 rounded-xl border border-[#D5D2BF] bg-[#FFFDF6] text-sm text-[#30372A] focus:outline-none focus:ring-2 focus:ring-[#7B8450]"
                  />
                  <button
                    type="submit"
                    disabled={isValidating || !manualInput.trim()}
                    className="bg-[#7B8450] hover:bg-[#687042] text-[#FFFDF6] px-5 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50"
                  >
                    Validate
                  </button>
                </div>
                <div className="text-[11px] text-[#7B826E] space-y-1">
                  <p>Allowed Quick Tokens:</p>
                  <code className="block bg-[#F2EFE2] p-1.5 rounded text-[10px]">
                    OLIVEPARK:SOLAPUR:KAMBAR_TALAV:Z1
                  </code>
                  <code className="block bg-[#F2EFE2] p-1.5 rounded text-[10px]">
                    OLIVEPARK:SOLAPUR:SIDDHESHWAR_MANDIR:Z1
                  </code>
                </div>
              </form>
            )}

            {/* Validation Loading state */}
            {isValidating && (
              <div className="flex items-center justify-center gap-2 text-xs font-semibold text-[#7B8450] py-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Verifying QR authenticity with Solapur Municipal Gateway...</span>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
