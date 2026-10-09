import {
  ParkingLocation,
  FeeBreakdown,
  ParkingSession,
  PaymentOrder,
  ReceiptData,
  DemoQRToken,
  AIDetectionResult,
  AdminOverviewStats
} from '../types';

const API_BASE = '/api';

export async function fetchLocations(): Promise<ParkingLocation[]> {
  const res = await fetch(`${API_BASE}/locations`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to fetch locations');
  return data.data;
}

export async function fetchLocationById(id: string): Promise<ParkingLocation> {
  const res = await fetch(`${API_BASE}/locations/${id}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to fetch location details');
  return data.data;
}

export async function validateQRCode(qrData: string): Promise<{
  is_valid: boolean;
  location: ParkingLocation;
  message: string;
}> {
  const res = await fetch(`${API_BASE}/qr/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ qr_data: qrData }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Invalid QR Code');
  return data;
}

export async function fetchDemoQRTokens(): Promise<DemoQRToken[]> {
  const res = await fetch(`${API_BASE}/qr/demo-tokens`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to fetch demo QR codes');
  return data.data;
}

export async function calculateParkingFee(
  locationId: string,
  vehicleType: string,
  durationHours: number
): Promise<FeeBreakdown> {
  const res = await fetch(`${API_BASE}/parking/calculate-fee`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      location_id: locationId,
      vehicle_type: vehicleType,
      duration_hours: durationHours,
    }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to calculate parking fee');
  return data.data;
}

export async function createParkingSession(payload: {
  location_id: string;
  vehicle_registration: string;
  vehicle_type: string;
  vehicle_model?: string;
  driver_name: string;
  driver_phone?: string;
  driver_email?: string;
  duration_hours: number;
}): Promise<ParkingSession> {
  const res = await fetch(`${API_BASE}/parking/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to check-in vehicle');
  return data.data;
}

export async function fetchSessionById(sessionId: string): Promise<ParkingSession> {
  const res = await fetch(`${API_BASE}/parking/sessions/${sessionId}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to fetch session');
  return data.data;
}

export async function completeParkingSession(sessionId: string): Promise<ParkingSession> {
  const res = await fetch(`${API_BASE}/parking/sessions/${sessionId}/complete`, {
    method: 'POST',
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to end session');
  return data.data;
}

export async function createPaymentOrder(sessionId: string): Promise<PaymentOrder> {
  const res = await fetch(`${API_BASE}/payments/create-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to create payment order');
  return data.data;
}

export async function verifyPayment(payload: {
  order_id: string;
  payment_id?: string;
  razorpay_signature?: string;
}): Promise<ReceiptData> {
  const res = await fetch(`${API_BASE}/payments/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Payment verification failed');
  return data.data;
}

export async function fetchReceipt(receiptId: string): Promise<ReceiptData> {
  const res = await fetch(`${API_BASE}/receipts/${receiptId}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to fetch receipt');
  return data.data;
}

export function getReceiptPdfDownloadUrl(receiptId: string): string {
  return `${API_BASE}/receipts/${receiptId}/pdf`;
}

export async function fetchParkingHistory(vehicle?: string, status?: string): Promise<ParkingSession[]> {
  const params = new URLSearchParams();
  if (vehicle) params.append('vehicle', vehicle);
  if (status) params.append('status', status);

  const res = await fetch(`${API_BASE}/parking/history?${params.toString()}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to fetch parking history');
  return data.data;
}

export async function detectVehiclePlate(formDataOrBase64: FormData | { image_base64: string }): Promise<AIDetectionResult> {
  let options: RequestInit = {};
  if (formDataOrBase64 instanceof FormData) {
    options = {
      method: 'POST',
      body: formDataOrBase64,
    };
  } else {
    options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formDataOrBase64),
    };
  }

  const res = await fetch(`${API_BASE}/ai/detect-plate`, options);
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to detect plate');
  return data.data;
}

export async function fetchAdminOverview(): Promise<{
  stats: AdminOverviewStats;
  locations: ParkingLocation[];
}> {
  const res = await fetch(`${API_BASE}/admin/overview`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to fetch admin overview');
  return data;
}

export async function updateAdminRates(
  locationId: string,
  rates: { rate_car: number; rate_motorcycle: number; rate_scooter: number; rate_other: number }
): Promise<ParkingLocation> {
  const res = await fetch(`${API_BASE}/admin/locations/${locationId}/rates`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(rates),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to update rates');
  return data.data;
}

export async function updateAdminCapacity(
  locationId: string,
  capacity: { total_capacity: number; simulated_occupied: number }
): Promise<ParkingLocation> {
  const res = await fetch(`${API_BASE}/admin/locations/${locationId}/capacity`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(capacity),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to update capacity');
  return data.data;
}

export function getAdminQRDownloadUrl(locationId: string): string {
  return `${API_BASE}/admin/locations/${locationId}/qr-download`;
}
