export interface ParkingLocation {
  id: string;
  name: string;
  city: string;
  state: string;
  address: string;
  landmark?: string;
  latitude: number;
  longitude: number;
  maps_url: string;
  total_capacity: number;
  current_occupied: number;
  available_capacity: number;
  is_demo_data: boolean;
  rates: {
    Car: number;
    Motorcycle: number;
    Scooter: number;
    Other: number;
  };
  qr_identifier: string;
  qr_preview_base64?: string;
  is_active: boolean;
  zone_name?: string;
}

export type VehicleCategory = 'Car' | 'Motorcycle' | 'Scooter' | 'Other';

export interface FeeBreakdown {
  vehicle_type: VehicleCategory;
  hourly_rate: number;
  input_duration_hours: number;
  billable_hours: number;
  currency: string;
  currency_symbol: string;
  billing_policy: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  is_demo_rate: boolean;
  location_id?: string;
  location_name?: string;
}

export interface ParkingSession {
  id: string;
  session_code: string;
  location_id: string;
  location_name?: string;
  vehicle_registration: string;
  vehicle_type: VehicleCategory;
  vehicle_model?: string;
  driver_name: string;
  driver_phone?: string;
  driver_email?: string;
  start_time: string;
  planned_duration_hours: number;
  expected_exit_time: string;
  actual_exit_time?: string;
  billable_hours: number;
  hourly_rate: number;
  total_amount: number;
  status: 'PENDING_PAYMENT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  created_at: string;
  has_receipt: boolean;
  receipt_id?: string;
  receipt_number?: string;
  payment?: {
    order_id: string;
    payment_id?: string;
    amount: number;
    gateway_mode: string;
    status: string;
  };
}

export interface PaymentOrder {
  session_id: string;
  order_id: string;
  amount: number;
  currency: string;
  key_id: string;
  gateway_mode: 'DEMO' | 'RAZORPAY_TEST';
  is_demo: boolean;
}

export interface ReceiptData {
  id: string;
  receipt_number: string;
  session_id: string;
  payment_transaction_id: string;
  verification_token: string;
  issued_at: string;
  pdf_url: string;
  session: ParkingSession;
  payment: {
    id: string;
    order_id: string;
    payment_id: string;
    amount: number;
    currency: string;
    gateway_mode: string;
    status: string;
    verified_at?: string;
  };
}

export interface DemoQRToken {
  location_id: string;
  name: string;
  zone: string;
  token: string;
  qr_image_base64: string;
}

export interface AIDetectionResult {
  plate_candidate: string;
  confidence: number;
  detected_contour_found: boolean;
  bounding_box?: [number, number, number, number];
  preview_overlay_url: string;
  message: string;
}

export interface AdminOverviewStats {
  total_sessions: number;
  active_sessions: number;
  completed_sessions: number;
  pending_sessions: number;
  total_revenue: number;
  demo_payments: number;
  verified_payments: number;
  gateway_mode: string;
  is_demo_gateway: boolean;
}
