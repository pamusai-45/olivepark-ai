import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  Cpu, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  RefreshCw,
  Eye,
  Camera
} from 'lucide-react';
import { detectVehiclePlate } from '../services/api';
import { AIDetectionResult } from '../types';

interface AIPlateScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlateSelected: (plate: string) => void;
}

export const AIPlateScannerModal: React.FC<AIPlateScannerModalProps> = ({
  isOpen,
  onClose,
  onPlateSelected
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [consentGiven, setConsentGiven] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [detectionResult, setDetectionResult] = useState<AIDetectionResult | null>(null);
  const [confirmedPlate, setConfirmedPlate] = useState('');

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setDetectionResult(null);
      setErrorMsg(null);
    }
  };

  const handleUsePreset = (presetPlate: string) => {
    // Generate a simulated license plate canvas to send real bytes to the OpenCV endpoint
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 160;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Draw simulated plate background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, 400, 160);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 6;
      ctx.strokeRect(10, 10, 380, 140);
      // IND badge
      ctx.fillStyle = '#003399';
      ctx.fillRect(15, 15, 30, 130);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('IND', 17, 85);
      // Text
      ctx.fillStyle = '#111111';
      ctx.font = 'bold 44px sans-serif';
      ctx.fillText(presetPlate, 75, 95);
    }

    const dataUrl = canvas.toDataURL('image/jpeg');
    setPreviewUrl(dataUrl);
    setSelectedFile(null);
    setDetectionResult(null);
    setErrorMsg(null);

    // Trigger AI detection with base64
    triggerDetection(dataUrl);
  };

  const triggerDetection = async (base64Img?: string) => {
    if (!consentGiven) {
      setErrorMsg('Driver consent is required to process vehicle images.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      let res: AIDetectionResult;
      if (base64Img) {
        res = await detectVehiclePlate({ image_base64: base64Img });
      } else if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        res = await detectVehiclePlate(formData);
      } else {
        setErrorMsg('Please select or capture a vehicle photo first.');
        setIsProcessing(false);
        return;
      }

      setDetectionResult(res);
      setConfirmedPlate(res.plate_candidate);
    } catch (err: any) {
      setErrorMsg(err.message || 'AI vision processing failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fadeIn">
      <div className="bg-[#FFFDF6] border border-[#E5E5D5] rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl relative max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#EAE7D8]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#7B8450] text-[#FFFDF6] flex items-center justify-center shadow-sm">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-['Manrope'] font-bold text-xl text-[#30372A]">
                  AI Number-Plate Recognition
                </h3>
                <span className="text-[10px] font-bold bg-[#DDE4C7] text-[#424A28] px-2 py-0.5 rounded-full">
                  OpenCV Module
                </span>
              </div>
              <p className="text-xs text-[#777A69]">
                Automated license plate scanning with driver confirmation
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
        <div className="py-5 space-y-4">
          
          {/* Quick Demo Sample Badges */}
          <div className="p-3 bg-[#F8F6EB] rounded-2xl border border-[#E5E2D2] space-y-2">
            <span className="text-xs font-semibold text-[#545C44] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#7B8450]" />
              Quick Test Presets (Solapur RTO MH 13):
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleUsePreset('MH 13 BN 4521')}
                className="px-3 py-1.5 rounded-xl bg-white border border-[#D5D2BE] text-xs font-bold text-[#30372A] hover:border-[#7B8450] hover:bg-[#F0F5E5] transition-all"
              >
                Sample 1: MH 13 BN 4521
              </button>
              <button
                type="button"
                onClick={() => handleUsePreset('MH 13 AQ 8819')}
                className="px-3 py-1.5 rounded-xl bg-white border border-[#D5D2BE] text-xs font-bold text-[#30372A] hover:border-[#7B8450] hover:bg-[#F0F5E5] transition-all"
              >
                Sample 2: MH 13 AQ 8819
              </button>
            </div>
          </div>

          {/* Upload or Drop */}
          <div className="border-2 border-dashed border-[#D2CEBA] hover:border-[#7B8450] rounded-2xl p-5 text-center transition-colors bg-[#FAF8F1]">
            <input
              type="file"
              accept="image/*"
              id="vehicle-photo-upload"
              onChange={handleFileChange}
              className="hidden"
            />
            <label 
              htmlFor="vehicle-photo-upload"
              className="cursor-pointer flex flex-col items-center justify-center space-y-2"
            >
              <Upload className="w-8 h-8 text-[#7B8450]" />
              <span className="text-sm font-semibold text-[#30372A]">
                Upload vehicle photo or take picture
              </span>
              <span className="text-xs text-[#7B826E]">
                JPEG, PNG files supported. Clear frontal view of number plate recommended.
              </span>
            </label>
          </div>

          {/* Consent Checkbox */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#F4F1E6] text-xs text-[#525A44]">
            <input
              type="checkbox"
              id="ai-consent-checkbox"
              checked={consentGiven}
              onChange={(e) => setConsentGiven(e.target.checked)}
              className="mt-0.5 rounded text-[#7B8450] focus:ring-[#7B8450]"
            />
            <label htmlFor="ai-consent-checkbox" className="cursor-pointer">
              I consent to image analysis solely for recognizing the vehicle registration number for this parking session.
            </label>
          </div>

          {/* Manual Run button if file selected manually */}
          {selectedFile && !detectionResult && (
            <button
              onClick={() => triggerDetection()}
              disabled={isProcessing || !consentGiven}
              className="w-full flex items-center justify-center gap-2 bg-[#7B8450] hover:bg-[#687042] text-[#FFFDF6] py-3 rounded-xl font-bold shadow-md disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing with OpenCV Edge Detection...</span>
                </>
              ) : (
                <>
                  <Cpu className="w-4 h-4" />
                  <span>Process Vehicle Image</span>
                </>
              )}
            </button>
          )}

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Detection Results View */}
          {detectionResult && (
            <div className="space-y-4 p-4 rounded-2xl bg-[#F0F5E5] border border-[#CCD8B3] animate-fadeIn">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#4D7C50] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Plate Region Detected
                </span>
                <span className="font-semibold text-[#5B634E] bg-white px-2 py-0.5 rounded border border-[#C5D2AA]">
                  Confidence: {Math.round(detectionResult.confidence * 100)}%
                </span>
              </div>

              {/* OpenCV Debug Image Preview */}
              {detectionResult.preview_overlay_url && (
                <div className="rounded-xl overflow-hidden border border-[#BDCBA0] bg-black">
                  <img 
                    src={detectionResult.preview_overlay_url} 
                    alt="Detected Plate Box" 
                    className="w-full h-40 object-contain mx-auto"
                  />
                </div>
              )}

              {/* Confirmation / Correction Input */}
              <div>
                <label className="block text-xs font-semibold text-[#30372A] mb-1">
                  Detected Number (Verify or Correct):
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={confirmedPlate}
                    onChange={(e) => setConfirmedPlate(e.target.value.toUpperCase())}
                    className="flex-1 font-mono font-bold text-lg px-4 py-2 rounded-xl border border-[#BDCBA0] bg-white text-[#30372A] uppercase tracking-wider"
                  />
                  <button
                    onClick={() => {
                      onPlateSelected(confirmedPlate);
                      onClose();
                    }}
                    className="bg-[#7B8450] hover:bg-[#687042] text-[#FFFDF6] px-5 py-2 rounded-xl text-sm font-bold shadow-sm"
                  >
                    Apply to Check-in
                  </button>
                </div>
                <p className="text-[11px] text-[#697258] mt-1 italic">
                  {detectionResult.message}
                </p>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
