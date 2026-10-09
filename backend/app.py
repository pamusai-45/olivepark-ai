import os
import re
import uuid
from datetime import datetime, timedelta
from flask import Flask, request, jsonify, send_file, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment configuration
load_dotenv()

from models import db, ParkingLocation, ParkingSession, PaymentTransaction, Receipt, PERMITTED_LOCATION_IDS
from fee_calculator import calculate_parking_fee, VALID_VEHICLE_TYPES
from qr_service import generate_location_qr_base64, save_location_qr_image, validate_qr_string, QR_PAYLOAD_MAP
from pdf_generator import generate_receipt_pdf
from payment_service import get_gateway_config, create_payment_order, verify_payment_signature
from ai_plate_ocr import preprocess_and_detect_plate_regions
from seed import seed_database

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Configuration
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
DB_PATH = os.path.join(BASE_DIR, "olivepark.db")
STATIC_DIR = os.path.join(BASE_DIR, "static")
PDF_DIR = os.path.join(STATIC_DIR, "receipts")
QR_DIR = os.path.join(STATIC_DIR, "qr")

os.makedirs(PDF_DIR, exist_ok=True)
os.makedirs(QR_DIR, exist_ok=True)

app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{DB_PATH}"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "olivepark-ai-solapur-secret-2026")

db.init_app(app)

# Initialize database and safe seeds
with app.app_context():
    seed_database(app)


# ==========================================
# 1. PARKING LOCATIONS API (Strictly 2 locations)
# ==========================================

@app.route("/api/locations", methods=["GET"])
def get_locations():
    """Returns only the two permitted Solapur parking locations."""
    locations = ParkingLocation.query.filter(ParkingLocation.id.in_(PERMITTED_LOCATION_IDS)).all()
    results = []
    for loc in locations:
        data = loc.to_dict()
        data["qr_preview_base64"] = generate_location_qr_base64(loc.id)
        results.append(data)
    return jsonify({"success": True, "data": results})

@app.route("/api/locations/<location_id>", methods=["GET"])
def get_location_details(location_id):
    if location_id not in PERMITTED_LOCATION_IDS:
        return jsonify({"success": False, "error": "Location not permitted or does not exist."}), 404

    loc = ParkingLocation.query.get(location_id)
    if not loc:
        return jsonify({"success": False, "error": "Location not found."}), 404

    data = loc.to_dict()
    data["qr_preview_base64"] = generate_location_qr_base64(loc.id)
    return jsonify({"success": True, "data": data})

@app.route("/api/admin/locations", methods=["POST"])
def reject_create_location():
    """Enforces rule: strictly only the two Solapur locations exist."""
    return jsonify({
        "success": False,
        "error": "Forbidden: OlivePark AI is strictly configured for Solapur with exactly two designated locations: Kambar Talav and Siddheshwar Mandir. Creating additional locations is disabled."
    }), 403


# ==========================================
# 2. QR CODE VALIDATION & GENERATION
# ==========================================

@app.route("/api/qr/validate", methods=["POST"])
def validate_qr():
    """Validates scanned QR code against allowed Solapur parking locations."""
    body = request.get_json() or {}
    qr_data = body.get("qr_data", "").strip()

    if not qr_data:
        return jsonify({"success": False, "error": "No QR data provided."}), 400

    is_valid, loc_id, zone_name, error_msg = validate_qr_string(qr_data)
    if not is_valid:
        return jsonify({
            "success": False, 
            "is_valid": False,
            "error": error_msg or "Invalid QR code. Please scan a valid OlivePark Solapur QR code."
        }), 400

    loc = ParkingLocation.query.get(loc_id)
    if not loc or not loc.is_active:
        return jsonify({"success": False, "is_valid": False, "error": "Parking facility is currently unavailable."}), 400

    loc_dict = loc.to_dict()
    loc_dict["zone_name"] = zone_name
    return jsonify({
        "success": True,
        "is_valid": True,
        "location": loc_dict,
        "message": f"Successfully verified {loc.name} ({zone_name})"
    })

@app.route("/api/qr/demo-tokens", methods=["GET"])
def get_demo_qr_tokens():
    """Returns quick test QR payloads and base64 images for demonstration."""
    tokens = []
    for loc_id, meta in QR_PAYLOAD_MAP.items():
        loc = ParkingLocation.query.get(loc_id)
        tokens.append({
            "location_id": loc_id,
            "name": meta["name"],
            "zone": meta["zone"],
            "token": meta["text_token"],
            "qr_image_base64": generate_location_qr_base64(loc_id)
        })
    return jsonify({"success": True, "data": tokens})


# ==========================================
# 3. FEE CALCULATION
# ==========================================

@app.route("/api/parking/calculate-fee", methods=["POST"])
def calculate_fee_endpoint():
    """Calculates server-side parking fee."""
    body = request.get_json() or {}
    location_id = body.get("location_id")
    vehicle_type = body.get("vehicle_type", "Car")
    duration_hours = body.get("duration_hours")

    if not location_id or location_id not in PERMITTED_LOCATION_IDS:
        return jsonify({"success": False, "error": "Invalid or missing parking location ID."}), 400

    loc = ParkingLocation.query.get(location_id)
    if not loc:
        return jsonify({"success": False, "error": "Parking location not found."}), 404

    location_rates = {
        "Car": loc.rate_car,
        "Motorcycle": loc.rate_motorcycle,
        "Scooter": loc.rate_scooter,
        "Other": loc.rate_other
    }

    success, breakdown, err = calculate_parking_fee(vehicle_type, duration_hours, location_rates)
    if not success:
        return jsonify({"success": False, "error": err}), 400

    breakdown["location_id"] = loc.id
    breakdown["location_name"] = loc.name
    return jsonify({"success": True, "data": breakdown})


# ==========================================
# 4. PARKING SESSIONS & CHECK-IN
# ==========================================

def normalize_vehicle_registration(plate: str) -> str:
    """Cleans and standardizes vehicle registration to uppercase."""
    clean = re.sub(r"[^A-Za-z0-9]", " ", plate).upper().strip()
    parts = clean.split()
    return " ".join(parts)

@app.route("/api/parking/sessions", methods=["POST"])
def create_parking_session():
    """
    Creates a new parking check-in session.
    Enforces validation, uppercase normalization, and checks for duplicate active sessions.
    """
    body = request.get_json() or {}
    location_id = body.get("location_id")
    raw_plate = body.get("vehicle_registration", "").strip()
    vehicle_type = body.get("vehicle_type", "").strip()
    vehicle_model = body.get("vehicle_model", "").strip()
    driver_name = body.get("driver_name", "").strip()
    driver_phone = body.get("driver_phone", "").strip()
    driver_email = body.get("driver_email", "").strip()
    duration_hours = body.get("duration_hours")

    # Validations
    if not location_id or location_id not in PERMITTED_LOCATION_IDS:
        return jsonify({"success": False, "error": "Please select a valid Solapur parking facility."}), 400

    if not raw_plate:
        return jsonify({"success": False, "error": "Vehicle registration number is required."}), 400

    normalized_plate = normalize_vehicle_registration(raw_plate)
    if len(normalized_plate) < 4:
        return jsonify({"success": False, "error": "Please provide a valid vehicle registration number."}), 400

    if vehicle_type not in VALID_VEHICLE_TYPES:
        return jsonify({"success": False, "error": f"Invalid vehicle type. Choose from {', '.join(VALID_VEHICLE_TYPES)}."}), 400

    if not driver_name:
        return jsonify({"success": False, "error": "Driver name is required."}), 400

    loc = ParkingLocation.query.get(location_id)
    if not loc:
        return jsonify({"success": False, "error": "Location does not exist."}), 404

    # Prevent duplicate active parking sessions for the same vehicle at the same location
    existing_active = ParkingSession.query.filter_by(
        location_id=location_id,
        vehicle_registration=normalized_plate,
        status="ACTIVE"
    ).first()

    if existing_active:
        return jsonify({
            "success": False,
            "error": f"An active parking session already exists for vehicle {normalized_plate} at {loc.name}. Please complete or exit that session first.",
            "existing_session_id": existing_active.id,
            "existing_session_code": existing_active.session_code
        }), 409

    # Server-side fee calculation
    location_rates = {
        "Car": loc.rate_car,
        "Motorcycle": loc.rate_motorcycle,
        "Scooter": loc.rate_scooter,
        "Other": loc.rate_other
    }
    ok, breakdown, err = calculate_parking_fee(vehicle_type, duration_hours, location_rates)
    if not ok:
        return jsonify({"success": False, "error": err}), 400

    # Server-generated timestamps
    start_time = datetime.utcnow()
    expected_exit = start_time + timedelta(hours=breakdown["input_duration_hours"])
    session_code = f"OPK-SOL-{uuid.uuid4().hex[:6].upper()}"

    session = ParkingSession(
        id=str(uuid.uuid4()),
        session_code=session_code,
        location_id=loc.id,
        vehicle_registration=normalized_plate,
        vehicle_type=vehicle_type,
        vehicle_model=vehicle_model or None,
        driver_name=driver_name,
        driver_phone=driver_phone or None,
        driver_email=driver_email or None,
        start_time=start_time,
        planned_duration_hours=breakdown["input_duration_hours"],
        expected_exit_time=expected_exit,
        billable_hours=breakdown["billable_hours"],
        hourly_rate=breakdown["hourly_rate"],
        total_amount=breakdown["total_amount"],
        status="PENDING_PAYMENT"
    )

    db.session.add(session)
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Parking check-in session initiated successfully.",
        "data": session.to_dict()
    }), 201

@app.route("/api/parking/sessions/<session_id>", methods=["GET"])
def get_session(session_id):
    session = ParkingSession.query.get(session_id)
    if not session:
        return jsonify({"success": False, "error": "Parking session not found."}), 404
    return jsonify({"success": True, "data": session.to_dict()})

@app.route("/api/parking/sessions/<session_id>/complete", methods=["POST"])
def complete_session(session_id):
    session = ParkingSession.query.get(session_id)
    if not session:
        return jsonify({"success": False, "error": "Parking session not found."}), 404

    if session.status != "ACTIVE":
        return jsonify({"success": False, "error": f"Session status is '{session.status}'. Only ACTIVE sessions can be closed."}), 400

    session.status = "COMPLETED"
    session.actual_exit_time = datetime.utcnow()
    db.session.commit()

    return jsonify({
        "success": True,
        "message": f"Parking session {session.session_code} has ended successfully.",
        "data": session.to_dict()
    })


# ==========================================
# 5. PAYMENT & RECEIPT WORKFLOW
# ==========================================

@app.route("/api/payments/create-order", methods=["POST"])
def payment_create_order():
    """Creates a unique order reference for the session."""
    body = request.get_json() or {}
    session_id = body.get("session_id")

    if not session_id:
        return jsonify({"success": False, "error": "Missing session_id parameter."}), 400

    session = ParkingSession.query.get(session_id)
    if not session:
        return jsonify({"success": False, "error": "Session not found."}), 404

    if session.status == "ACTIVE" and session.payment and session.payment.status == "SUCCESS":
        return jsonify({
            "success": False, 
            "error": "This parking session is already paid and active.",
            "is_already_paid": True,
            "session": session.to_dict()
        }), 400

    # Check if transaction already created
    tx = PaymentTransaction.query.filter_by(session_id=session.id).first()
    if tx and tx.status == "SUCCESS":
        return jsonify({"success": False, "error": "Session already has a completed transaction."}), 400

    success, order_data, err = create_payment_order(session.id, session.total_amount)
    if not success:
        return jsonify({"success": False, "error": err}), 500

    if not tx:
        tx = PaymentTransaction(
            id=str(uuid.uuid4()),
            session_id=session.id,
            order_id=order_data["order_id"],
            amount=session.total_amount,
            currency="INR",
            gateway_mode=order_data["gateway_mode"],
            status="CREATED"
        )
        db.session.add(tx)
    else:
        tx.order_id = order_data["order_id"]
        tx.gateway_mode = order_data["gateway_mode"]
        tx.status = "CREATED"

    db.session.commit()

    return jsonify({
        "success": True,
        "data": {
            "session_id": session.id,
            "order_id": order_data["order_id"],
            "amount": session.total_amount,
            "currency": "INR",
            "key_id": order_data["key_id"],
            "gateway_mode": order_data["gateway_mode"],
            "is_demo": order_data["is_demo"]
        }
    })

@app.route("/api/payments/verify", methods=["POST"])
def payment_verify():
    """
    Verifies payment signature / demo verification, transitions session to ACTIVE,
    and issues an immutable digital receipt.
    """
    body = request.get_json() or {}
    order_id = body.get("order_id")
    payment_id = body.get("payment_id")
    signature = body.get("razorpay_signature")

    if not order_id:
        return jsonify({"success": False, "error": "Missing order_id."}), 400

    tx = PaymentTransaction.query.filter_by(order_id=order_id).first()
    if not tx:
        return jsonify({"success": False, "error": "Transaction order not found."}), 404

    # Idempotency check: if already processed successfully, return existing receipt
    if tx.status == "SUCCESS":
        receipt = Receipt.query.filter_by(session_id=tx.session_id).first()
        return jsonify({
            "success": True,
            "message": "Payment was already verified.",
            "data": receipt.to_dict() if receipt else None
        })

    # Verify signature
    is_valid, err_msg = verify_payment_signature(order_id, payment_id or f"pay_demo_{uuid.uuid4().hex[:10]}", signature)
    if not is_valid:
        tx.status = "FAILED"
        tx.failure_reason = err_msg
        db.session.commit()
        return jsonify({"success": False, "error": f"Payment verification failed: {err_msg}"}), 400

    # Verification succeeded
    now = datetime.utcnow()
    tx.status = "SUCCESS"
    tx.payment_id = payment_id or f"pay_demo_{uuid.uuid4().hex[:10]}"
    tx.verified_at = now

    session = ParkingSession.query.get(tx.session_id)
    session.status = "ACTIVE"
    session.updated_at = now

    # Issue Receipt
    receipt_number = f"RCPT-OPK-2026-{uuid.uuid4().hex[:8].upper()}"
    verification_token = f"SEC-{uuid.uuid4().hex.upper()}"
    pdf_filename = f"receipt_{receipt_number}.pdf"
    pdf_path = os.path.join(PDF_DIR, pdf_filename)

    receipt = Receipt(
        id=str(uuid.uuid4()),
        receipt_number=receipt_number,
        session_id=session.id,
        payment_transaction_id=tx.id,
        verification_token=verification_token,
        pdf_filename=pdf_filename,
        issued_at=now
    )
    db.session.add(receipt)
    db.session.commit()

    # Pre-generate server-side PDF receipt
    receipt_dict = {
        "receipt_number": receipt.receipt_number,
        "session_code": session.session_code,
        "location_name": session.location.name,
        "location_address": session.location.address,
        "vehicle_registration": session.vehicle_registration,
        "vehicle_type": session.vehicle_type,
        "driver_name": session.driver_name,
        "driver_phone": session.driver_phone or "N/A",
        "driver_email": session.driver_email or "N/A",
        "start_time": session.start_time.strftime("%d %b %Y, %I:%M %p UTC"),
        "expected_exit_time": session.expected_exit_time.strftime("%d %b %Y, %I:%M %p UTC"),
        "duration_hours": session.planned_duration_hours,
        "billable_hours": session.billable_hours,
        "hourly_rate": session.hourly_rate,
        "total_amount": session.total_amount,
        "order_id": tx.order_id,
        "payment_id": tx.payment_id,
        "gateway_mode": tx.gateway_mode,
        "payment_status": "PAID & VERIFIED",
        "issued_at": receipt.issued_at.strftime("%d %b %Y, %I:%M %p UTC"),
        "verification_token": receipt.verification_token,
        "verification_url": f"https://olivepark.solapur.gov.in/verify/{receipt.receipt_number}"
    }

    try:
        generate_receipt_pdf(receipt_dict, output_path=pdf_path)
    except Exception as e:
        print(f"[Warning] PDF generation error: {e}")

    return jsonify({
        "success": True,
        "message": "Payment verified successfully. Parking session is now ACTIVE.",
        "data": receipt.to_dict()
    })

@app.route("/api/payments/webhook", methods=["POST"])
def payment_webhook():
    """Webhook listener for asynchronous payment notifications."""
    payload = request.get_data(as_text=True)
    # Return 200 OK acknowledging receipt
    return jsonify({"status": "ok", "message": "Webhook received"}), 200

@app.route("/api/receipts/<receipt_id>", methods=["GET"])
def get_receipt(receipt_id):
    receipt = Receipt.query.get(receipt_id)
    if not receipt:
        return jsonify({"success": False, "error": "Receipt record not found."}), 404
    return jsonify({"success": True, "data": receipt.to_dict()})

@app.route("/api/receipts/<receipt_id>/pdf", methods=["GET"])
def download_receipt_pdf(receipt_id):
    receipt = Receipt.query.get(receipt_id)
    if not receipt:
        return jsonify({"success": False, "error": "Receipt not found."}), 404

    pdf_filename = receipt.pdf_filename or f"receipt_{receipt.receipt_number}.pdf"
    pdf_path = os.path.join(PDF_DIR, pdf_filename)

    # If PDF file does not exist on disk, re-generate on the fly
    if not os.path.exists(pdf_path):
        session = receipt.session
        tx = receipt.payment_transaction
        receipt_dict = {
            "receipt_number": receipt.receipt_number,
            "session_code": session.session_code,
            "location_name": session.location.name,
            "location_address": session.location.address,
            "vehicle_registration": session.vehicle_registration,
            "vehicle_type": session.vehicle_type,
            "driver_name": session.driver_name,
            "driver_phone": session.driver_phone or "N/A",
            "driver_email": session.driver_email or "N/A",
            "start_time": session.start_time.strftime("%d %b %Y, %I:%M %p UTC"),
            "expected_exit_time": session.expected_exit_time.strftime("%d %b %Y, %I:%M %p UTC"),
            "duration_hours": session.planned_duration_hours,
            "billable_hours": session.billable_hours,
            "hourly_rate": session.hourly_rate,
            "total_amount": session.total_amount,
            "order_id": tx.order_id if tx else "N/A",
            "payment_id": tx.payment_id if tx else "N/A",
            "gateway_mode": tx.gateway_mode if tx else "DEMO",
            "payment_status": "PAID & VERIFIED",
            "issued_at": receipt.issued_at.strftime("%d %b %Y, %I:%M %p UTC"),
            "verification_token": receipt.verification_token,
            "verification_url": f"https://olivepark.solapur.gov.in/verify/{receipt.receipt_number}"
        }
        generate_receipt_pdf(receipt_dict, output_path=pdf_path)

    return send_file(
        pdf_path,
        mimetype="application/pdf",
        as_attachment=True,
        download_name=f"OlivePark_Receipt_{receipt.receipt_number}.pdf"
    )

@app.route("/api/receipts/verify/<receipt_number>", methods=["GET"])
def public_verify_receipt(receipt_number):
    """Public verification endpoint (e.g. for parking attendants scanning the QR on a receipt)."""
    receipt = Receipt.query.filter_by(receipt_number=receipt_number).first()
    if not receipt:
        return jsonify({"success": False, "verified": False, "error": "Invalid receipt identifier."}), 404

    session = receipt.session
    return jsonify({
        "success": True,
        "verified": True,
        "receipt_number": receipt.receipt_number,
        "issued_at": receipt.issued_at.isoformat(),
        "location": session.location.name,
        "vehicle_registration": session.vehicle_registration,
        "vehicle_type": session.vehicle_type,
        "driver_name": session.driver_name,
        "status": session.status,
        "valid_until": session.expected_exit_time.isoformat(),
        "total_amount": session.total_amount,
        "verification_token": receipt.verification_token
    })


# ==========================================
# 6. PARKING HISTORY & PERSISTENCE
# ==========================================

@app.route("/api/parking/history", methods=["GET"])
def get_parking_history():
    """Returns parking sessions history, optionally filtered by vehicle."""
    vehicle_query = request.args.get("vehicle", "").strip()
    status_filter = request.args.get("status", "").strip()

    query = ParkingSession.query.order_by(ParkingSession.created_at.desc())

    if vehicle_query:
        norm = normalize_vehicle_registration(vehicle_query)
        query = query.filter(ParkingSession.vehicle_registration.ilike(f"%{norm}%"))

    if status_filter:
        query = query.filter(ParkingSession.status == status_filter.upper())

    sessions = query.limit(100).all()
    return jsonify({
        "success": True,
        "count": len(sessions),
        "data": [s.to_dict() for s in sessions]
    })


# ==========================================
# 7. AI NUMBER-PLATE OCR INTEGRATION POINT
# ==========================================

@app.route("/api/ai/detect-plate", methods=["POST"])
def ai_detect_plate():
    """
    AI Number Plate Detection endpoint.
    Accepts vehicle image (multipart file or base64 json) with driver consent.
    Returns detected bounding box, confidence score, and suggested plate for driver confirmation.
    """
    image_bytes = None

    if "file" in request.files:
        file = request.files["file"]
        image_bytes = file.read()
    else:
        body = request.get_json() or {}
        img_b64 = body.get("image_base64", "")
        if img_b64:
            if "," in img_b64:
                img_b64 = img_b64.split(",")[1]
            import base64
            try:
                image_bytes = base64.b64decode(img_b64)
            except Exception:
                return jsonify({"success": False, "error": "Invalid base64 image data."}), 400

    if not image_bytes:
        return jsonify({"success": False, "error": "No vehicle image file or image_base64 provided."}), 400

    success, result, err = preprocess_and_detect_plate_regions(image_bytes)
    if not success:
        return jsonify({"success": False, "error": err}), 400

    return jsonify({
        "success": True,
        "data": result
    })


# ==========================================
# 8. ADMIN DASHBOARD & MANAGEMENT
# ==========================================

@app.route("/api/admin/overview", methods=["GET"])
def admin_overview():
    """Overview statistics for administrator."""
    total_sessions = ParkingSession.query.count()
    active_sessions = ParkingSession.query.filter_by(status="ACTIVE").count()
    completed_sessions = ParkingSession.query.filter_by(status="COMPLETED").count()
    pending_sessions = ParkingSession.query.filter_by(status="PENDING_PAYMENT").count()

    total_revenue = db.session.query(db.func.sum(PaymentTransaction.amount))\
        .filter(PaymentTransaction.status == "SUCCESS").scalar() or 0.0

    demo_tx_count = PaymentTransaction.query.filter_by(gateway_mode="DEMO", status="SUCCESS").count()
    live_tx_count = PaymentTransaction.query.filter_by(gateway_mode="RAZORPAY_TEST", status="SUCCESS").count()

    locations = ParkingLocation.query.filter(ParkingLocation.id.in_(PERMITTED_LOCATION_IDS)).all()
    loc_stats = [l.to_dict() for l in locations]

    gateway_cfg = get_gateway_config()

    return jsonify({
        "success": True,
        "stats": {
            "total_sessions": total_sessions,
            "active_sessions": active_sessions,
            "completed_sessions": completed_sessions,
            "pending_sessions": pending_sessions,
            "total_revenue": round(total_revenue, 2),
            "demo_payments": demo_tx_count,
            "verified_payments": live_tx_count + demo_tx_count,
            "gateway_mode": gateway_cfg["mode"],
            "is_demo_gateway": gateway_cfg["is_demo_mode"]
        },
        "locations": loc_stats
    })

@app.route("/api/admin/locations/<location_id>/rates", methods=["PUT"])
def admin_update_rates(location_id):
    """Updates hourly rates for one of the two permitted Solapur locations."""
    if location_id not in PERMITTED_LOCATION_IDS:
        return jsonify({"success": False, "error": "Location not permitted."}), 404

    loc = ParkingLocation.query.get(location_id)
    if not loc:
        return jsonify({"success": False, "error": "Location not found."}), 404

    body = request.get_json() or {}
    try:
        if "rate_car" in body and float(body["rate_car"]) > 0:
            loc.rate_car = float(body["rate_car"])
        if "rate_motorcycle" in body and float(body["rate_motorcycle"]) > 0:
            loc.rate_motorcycle = float(body["rate_motorcycle"])
        if "rate_scooter" in body and float(body["rate_scooter"]) > 0:
            loc.rate_scooter = float(body["rate_scooter"])
        if "rate_other" in body and float(body["rate_other"]) > 0:
            loc.rate_other = float(body["rate_other"])
        
        loc.updated_at = datetime.utcnow()
        db.session.commit()

        return jsonify({
            "success": True,
            "message": f"Updated rates for {loc.name}",
            "data": loc.to_dict()
        })
    except Exception as e:
        return jsonify({"success": False, "error": f"Failed to update rates: {str(e)}"}), 400

@app.route("/api/admin/locations/<location_id>/capacity", methods=["PUT"])
def admin_update_capacity(location_id):
    """Updates capacity values for one of the two permitted Solapur locations."""
    if location_id not in PERMITTED_LOCATION_IDS:
        return jsonify({"success": False, "error": "Location not permitted."}), 404

    loc = ParkingLocation.query.get(location_id)
    if not loc:
        return jsonify({"success": False, "error": "Location not found."}), 404

    body = request.get_json() or {}
    try:
        if "total_capacity" in body and int(body["total_capacity"]) > 0:
            loc.total_capacity = int(body["total_capacity"])
        if "simulated_occupied" in body and int(body["simulated_occupied"]) >= 0:
            loc.simulated_occupied = int(body["simulated_occupied"])
        
        loc.updated_at = datetime.utcnow()
        db.session.commit()

        return jsonify({
            "success": True,
            "message": f"Updated capacity for {loc.name}",
            "data": loc.to_dict()
        })
    except Exception as e:
        return jsonify({"success": False, "error": f"Failed to update capacity: {str(e)}"}), 400

@app.route("/api/admin/locations/<location_id>/qr-download", methods=["GET"])
def admin_download_qr(location_id):
    """Downloads high-res printable QR code PNG for the location."""
    if location_id not in PERMITTED_LOCATION_IDS:
        return jsonify({"success": False, "error": "Location not permitted."}), 404

    png_path = os.path.join(QR_DIR, f"{location_id}_standee.png")
    save_location_qr_image(location_id, png_path)

    return send_file(
        png_path,
        mimetype="image/png",
        as_attachment=True,
        download_name=f"OlivePark_{location_id}_QR.png"
    )

@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "healthy",
        "app": "OlivePark AI - Solapur Smart Parking",
        "timestamp": datetime.utcnow().isoformat(),
        "locations_count": ParkingLocation.query.count(),
        "active_sessions": ParkingSession.query.filter_by(status="ACTIVE").count()
    })


FRONTEND_DIST_DIR = os.path.abspath(os.path.join(BASE_DIR, "..", "frontend", "dist"))

# ==========================================
# 9. FRONTEND PRODUCTION SPA SERVING
# ==========================================

@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_frontend(path):
    if path.startswith("api/"):
        return jsonify({"success": False, "error": "API route not found"}), 404

    target_file = os.path.join(FRONTEND_DIST_DIR, path)
    if path and os.path.exists(target_file) and not os.path.isdir(target_file):
        return send_from_directory(FRONTEND_DIST_DIR, path)

    index_file = os.path.join(FRONTEND_DIST_DIR, "index.html")
    if os.path.exists(index_file):
        return send_from_directory(FRONTEND_DIST_DIR, "index.html")

    return jsonify({
        "success": True,
        "message": "OlivePark AI Solapur Backend Running. Build frontend with 'npm run build' to view full UI."
    })


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)

