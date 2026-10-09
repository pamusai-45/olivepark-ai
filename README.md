# 🌿 OlivePark AI — Smart Parking System (Solapur, Maharashtra)

> **Park Smarter. Pay Seamlessly.**  
> A complete, fully functional, responsive AI Smart Parking web application built for **Solapur, Maharashtra**.

---

## 🏛️ 1. Supported Parking Locations

OlivePark AI is strictly configured for exactly **two official municipal parking locations in Solapur**:

1. **Kambar Talav, Solapur**
   - *Address:* Near Kambar Talav, North Sadar Bazar, Solapur, Maharashtra 413003
   - *Landmark:* Kambar Lake Promenade & Garden Enclosure
   - *Zone:* Kambar Lake Promenade - Zone A
   - *Tariffs:* Car ₹40/hr · Bike ₹20/hr · Scooter ₹20/hr · Other ₹50/hr
   - *QR Token:* `OLIVEPARK:SOLAPUR:KAMBAR_TALAV:Z1`

2. **Siddheshwar Mandir, Solapur**
   - *Address:* Siddheshwar Lake Complex, Budhwar Peth, Solapur, Maharashtra 413002
   - *Landmark:* Historic Siddheshwar Temple Lake Concourse
   - *Zone:* Siddheshwar Temple Concourse - Zone B
   - *Tariffs:* Car ₹50/hr · Bike ₹25/hr · Scooter ₹25/hr · Other ₹60/hr
   - *QR Token:* `OLIVEPARK:SOLAPUR:SIDDHESHWAR_MANDIR:Z1`

> ⚠️ **Strict Constraint:** The addition of any third location through the interface or API is strictly blocked at the backend level (`HTTP 403 Forbidden`).

---

## 🎨 2. Design System & Aesthetics

Crafted with an elegant, nature-inspired palette:
* **Background:** `#F7F5EA` (warm cream)
* **Primary:** `#7B8450` (olive green)
* **Secondary:** `#A8B58A` (sage green)
* **Light accent:** `#DDE4C7`
* **Cards & Panels:** `#FFFDF6` (ivory white)
* **Text:** `#30372A` (deep forest olive)
* **Muted text:** `#777A69`
* **Borders:** `#E5E5D5`
* **Success:** `#4D7C50`
* **Typography:** Inter & Manrope

---

## 🚀 3. Architecture & Tech Stack

* **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS v4 + Lucide Icons
* **QR Scanner:** `html5-qrcode` with device camera support, manual input, and 1-click interactive demo standees
* **Backend:** Python Flask REST API
* **Database:** SQLite with SQLAlchemy ORM (persisted at `backend/olivepark.db`)
* **Fee Calculation:** Server-side billing module (minimum 1 hour; charges for each started hour)
* **Payment Gateway:** Razorpay test mode integration with verified **Demo Payment Mode** fallback
* **PDF Engine:** Python `ReportLab` generating branded, downloadable, and printable digital receipts
* **AI Computer Vision:** Modular OpenCV (`cv2`) image preprocessing, edge detection, and license plate candidate detection with driver confirmation

---

## 📂 4. Project Folder Structure

```
OlivePark-AI/
├── backend/
│   ├── app.py                     # Flask REST API routes & controllers
│   ├── models.py                  # Database models (Locations, Sessions, Payments, Receipts)
│   ├── seed.py                    # Database seeding (Strictly 2 Solapur locations)
│   ├── fee_calculator.py          # Server-side fee calculation engine
│   ├── qr_service.py              # QR generation & validation
│   ├── pdf_generator.py           # ReportLab PDF receipt generator
│   ├── payment_service.py         # Razorpay & Demo payment handler
│   ├── ai_plate_ocr.py            # OpenCV computer vision plate recognition
│   ├── tests/
│   │   ├── test_fee_calculator.py # Unit tests for fee calculation
│   │   ├── test_qr_validation.py  # Unit tests for QR validation
│   │   └── test_parking_flow.py   # Integration tests for end-to-end flow
│   ├── requirements.txt           # Python backend dependencies
│   ├── .env                       # Environment configuration
│   └── static/                    # Generated PDF receipts and QR PNGs
├── frontend/
│   ├── src/
│   │   ├── components/            # Reusable UI components (Navbar, Footer, Modals, Cards)
│   │   ├── pages/                 # Landing, Find Parking, Check-In, My Parking, Admin
│   │   ├── services/api.ts        # API client for Flask endpoints
│   │   ├── types/index.ts         # TypeScript definitions
│   │   ├── App.tsx                # State management and view router
│   │   └── index.css              # Custom styling & Tailwind configuration
│   ├── package.json
│   └── vite.config.ts
├── .env.example
├── run_dev.bat                    # One-click startup script for Windows
└── README.md
```

---

## 🛠️ 5. Installation & Setup

### Prerequisites
* **Python:** 3.10+ (Tested on Python 3.14)
* **Node.js:** v18+ (Tested on Node v24)
* **npm:** v9+

### A. Backend Setup
1. Open a terminal in `backend/`:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```
2. Initialize and seed the SQLite database:
   ```bash
   python seed.py
   ```
3. Run the Flask development server:
   ```bash
   python app.py
   ```
   *The backend will run at `http://127.0.0.1:5000`.*

### B. Frontend Setup
1. In a separate terminal in `frontend/`:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   *The Vite frontend will start at `http://localhost:3000` (or `http://localhost:5173`).*

---

## 🧪 6. Running Automated Tests

Run the complete test suite to verify fee calculation, QR validation, duplicate parking prevention, and payment verification:

```bash
cd backend
python -m unittest discover -s tests -p "test_*.py"
```

**Results:**
* `test_fee_calculator.py`: 5 passed
* `test_qr_validation.py`: 5 passed
* `test_parking_flow.py`: 3 passed (including duplicate active session prevention)
* **Total:** 13/13 passing tests.

---

## 🚗 7. End-to-End User Journey

1. **Select Parking Location:**
   - Go to **Find Parking** on the navbar.
   - Choose **Kambar Talav** or **Siddheshwar Mandir**.
   - Review live capacity meters, directions link, and hourly tariffs.
2. **Scan QR Standee:**
   - Click **Scan QR Code**.
   - Use device camera or click either of the **1-Click Demo QR Standees** (`Kambar Talav` or `Siddheshwar Mandir`).
   - The system validates the code with the backend and displays the recognized facility.
3. **Vehicle Details & AI License Plate:**
   - Enter your vehicle number or click **Scan Plate with AI**.
   - Select vehicle category (`Car`, `Motorcycle`, `Scooter`, `Other`).
   - Enter driver name and contact information.
   - Select planned duration; the live fee breakdown computes the tariff server-side.
4. **Checkout & Payment:**
   - Click **Proceed to Payment**.
   - Choose **Demo Payment Mode** (instant verified test transaction) or **Razorpay Testnet**.
   - Click **Pay & Issue Receipt**. Confetti will celebrate successful payment!
5. **Download & Print Receipt:**
   - View your digital pass with security token and attendant verification code.
   - Click **Download PDF** to fetch the server-generated ReportLab PDF document.
   - Click **Print** or **Share**.
6. **My Parking History & Exit:**
   - Visit **My Parking** to see all active and completed sessions persisted in SQLite.
   - Click **End Session** when leaving to mark the session as `COMPLETED`.
7. **Admin Dashboard:**
   - Visit **Admin Portal** to inspect total revenue, adjust hourly tariffs, manage capacity, and download high-resolution QR PNGs for physical standees.

---

## 💳 8. Razorpay Test Mode Setup

To enable Razorpay test mode:
1. Obtain test credentials from the [Razorpay Dashboard](https://dashboard.razorpay.com).
2. Set them in `backend/.env`:
   ```env
   RAZORPAY_KEY_ID=rzp_test_YourTestKeyId
   RAZORPAY_KEY_SECRET=YourTestKeySecret
   ```
3. Restart the backend. OlivePark AI will switch payment processing to the live Razorpay test sandbox.
4. If left blank, the system automatically uses the verified **Demo Payment Mode**.
