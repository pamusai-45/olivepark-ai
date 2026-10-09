import uuid
from datetime import datetime, timezone
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

# Strictly only these two locations are permitted in OlivePark AI
PERMITTED_LOCATION_IDS = {"loc-kambar-talav", "loc-siddheshwar-mandir"}

class ParkingLocation(db.Model):
    __tablename__ = "parking_locations"

    id = db.Column(db.String(64), primary_key=True)  # e.g. "loc-kambar-talav"
    name = db.Column(db.String(128), nullable=False)
    city = db.Column(db.String(64), default="Solapur", nullable=False)
    state = db.Column(db.String(64), default="Maharashtra", nullable=False)
    address = db.Column(db.String(256), nullable=False)
    landmark = db.Column(db.String(128), nullable=True)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    maps_url = db.Column(db.String(512), nullable=False)
    total_capacity = db.Column(db.Integer, default=50, nullable=False)
    simulated_occupied = db.Column(db.Integer, default=18, nullable=False)
    is_demo_data = db.Column(db.Boolean, default=True)

    # Hourly rates in INR
    rate_car = db.Column(db.Float, default=40.0, nullable=False)
    rate_motorcycle = db.Column(db.Float, default=20.0, nullable=False)
    rate_scooter = db.Column(db.Float, default=20.0, nullable=False)
    rate_other = db.Column(db.Float, default=50.0, nullable=False)

    qr_identifier = db.Column(db.String(128), unique=True, nullable=False)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    sessions = db.relationship("ParkingSession", backref="location", lazy=True)

    def to_dict(self):
        # Calculate active sessions dynamically to complement simulated base occupancy
        active_count = ParkingSession.query.filter_by(
            location_id=self.id, 
            status="ACTIVE"
        ).count()
        total_occupied = min(self.total_capacity, self.simulated_occupied + active_count)
        available_capacity = max(0, self.total_capacity - total_occupied)

        return {
            "id": self.id,
            "name": self.name,
            "city": self.city,
            "state": self.state,
            "address": self.address,
            "landmark": self.landmark,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "maps_url": self.maps_url,
            "total_capacity": self.total_capacity,
            "current_occupied": total_occupied,
            "available_capacity": available_capacity,
            "is_demo_data": self.is_demo_data,
            "rates": {
                "Car": self.rate_car,
                "Motorcycle": self.rate_motorcycle,
                "Scooter": self.rate_scooter,
                "Other": self.rate_other
            },
            "qr_identifier": self.qr_identifier,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }


class ParkingSession(db.Model):
    __tablename__ = "parking_sessions"

    id = db.Column(db.String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    session_code = db.Column(db.String(32), unique=True, nullable=False)
    location_id = db.Column(db.String(64), db.ForeignKey("parking_locations.id"), nullable=False)
    
    vehicle_registration = db.Column(db.String(32), nullable=False, index=True)
    vehicle_type = db.Column(db.String(32), nullable=False)
    vehicle_model = db.Column(db.String(64), nullable=True)
    driver_name = db.Column(db.String(128), nullable=False)
    driver_phone = db.Column(db.String(32), nullable=True)
    driver_email = db.Column(db.String(128), nullable=True)

    start_time = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    planned_duration_hours = db.Column(db.Float, nullable=False)
    expected_exit_time = db.Column(db.DateTime, nullable=False)
    actual_exit_time = db.Column(db.DateTime, nullable=True)

    billable_hours = db.Column(db.Integer, nullable=False)
    hourly_rate = db.Column(db.Float, nullable=False)
    total_amount = db.Column(db.Float, nullable=False)

    # Status: PENDING_PAYMENT, ACTIVE, COMPLETED, CANCELLED
    status = db.Column(db.String(32), default="PENDING_PAYMENT", nullable=False, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    payment = db.relationship("PaymentTransaction", backref="session", uselist=False, lazy=True)
    receipt = db.relationship("Receipt", backref="session", uselist=False, lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "session_code": self.session_code,
            "location_id": self.location_id,
            "location_name": self.location.name if self.location else None,
            "vehicle_registration": self.vehicle_registration,
            "vehicle_type": self.vehicle_type,
            "vehicle_model": self.vehicle_model,
            "driver_name": self.driver_name,
            "driver_phone": self.driver_phone,
            "driver_email": self.driver_email,
            "start_time": self.start_time.isoformat() if self.start_time else None,
            "planned_duration_hours": self.planned_duration_hours,
            "expected_exit_time": self.expected_exit_time.isoformat() if self.expected_exit_time else None,
            "actual_exit_time": self.actual_exit_time.isoformat() if self.actual_exit_time else None,
            "billable_hours": self.billable_hours,
            "hourly_rate": self.hourly_rate,
            "total_amount": self.total_amount,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "has_receipt": bool(self.receipt),
            "receipt_id": self.receipt.id if self.receipt else None,
            "receipt_number": self.receipt.receipt_number if self.receipt else None,
            "payment": self.payment.to_dict() if self.payment else None
        }


class PaymentTransaction(db.Model):
    __tablename__ = "payment_transactions"

    id = db.Column(db.String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = db.Column(db.String(64), db.ForeignKey("parking_sessions.id"), unique=True, nullable=False)
    order_id = db.Column(db.String(128), unique=True, nullable=False)
    payment_id = db.Column(db.String(128), unique=True, nullable=True)
    amount = db.Column(db.Float, nullable=False)
    currency = db.Column(db.String(8), default="INR", nullable=False)
    gateway_mode = db.Column(db.String(32), default="DEMO", nullable=False)  # DEMO or RAZORPAY_TEST
    status = db.Column(db.String(32), default="CREATED", nullable=False)     # CREATED, SUCCESS, FAILED
    razorpay_signature = db.Column(db.String(256), nullable=True)
    failure_reason = db.Column(db.String(256), nullable=True)
    verified_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "session_id": self.session_id,
            "order_id": self.order_id,
            "payment_id": self.payment_id,
            "amount": self.amount,
            "currency": self.currency,
            "gateway_mode": self.gateway_mode,
            "status": self.status,
            "verified_at": self.verified_at.isoformat() if self.verified_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }


class Receipt(db.Model):
    __tablename__ = "receipts"

    id = db.Column(db.String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    receipt_number = db.Column(db.String(64), unique=True, nullable=False)
    session_id = db.Column(db.String(64), db.ForeignKey("parking_sessions.id"), unique=True, nullable=False)
    payment_transaction_id = db.Column(db.String(64), db.ForeignKey("payment_transactions.id"), nullable=False)
    verification_token = db.Column(db.String(64), unique=True, nullable=False)
    pdf_filename = db.Column(db.String(128), nullable=True)
    issued_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    payment_transaction = db.relationship("PaymentTransaction", backref="receipt_record", uselist=False, lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "receipt_number": self.receipt_number,
            "session_id": self.session_id,
            "payment_transaction_id": self.payment_transaction_id,
            "verification_token": self.verification_token,
            "issued_at": self.issued_at.isoformat() if self.issued_at else None,
            "pdf_url": f"/api/receipts/{self.id}/pdf",
            "session": self.session.to_dict() if self.session else None,
            "payment": self.payment_transaction.to_dict() if self.payment_transaction else None
        }
