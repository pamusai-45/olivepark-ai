import os
from models import db, ParkingLocation, ParkingSession, PaymentTransaction, Receipt
from datetime import datetime, timedelta
import uuid

def seed_database(app):
    with app.app_context():
        db.create_all()

        # Seed ONLY the 2 allowed locations
        loc1 = ParkingLocation.query.get("loc-kambar-talav")
        if not loc1:
            loc1 = ParkingLocation(
                id="loc-kambar-talav",
                name="Kambar Talav, Solapur",
                city="Solapur",
                state="Maharashtra",
                address="Near Kambar Talav, North Sadar Bazar, Solapur, Maharashtra 413003",
                landmark="Kambar Lake Promenade & Garden Enclosure",
                latitude=17.6599,
                longitude=75.9064,
                maps_url="https://www.google.com/maps/search/?api=1&query=17.6599,75.9064",
                total_capacity=60,
                simulated_occupied=22,
                is_demo_data=True,
                rate_car=40.0,
                rate_motorcycle=20.0,
                rate_scooter=20.0,
                rate_other=50.0,
                qr_identifier="OLIVEPARK:SOLAPUR:KAMBAR_TALAV:Z1",
                is_active=True
            )
            db.session.add(loc1)

        loc2 = ParkingLocation.query.get("loc-siddheshwar-mandir")
        if not loc2:
            loc2 = ParkingLocation(
                id="loc-siddheshwar-mandir",
                name="Siddheshwar Mandir, Solapur",
                city="Solapur",
                state="Maharashtra",
                address="Siddheshwar Lake Complex, Budhwar Peth, Solapur, Maharashtra 413002",
                landmark="Historic Siddheshwar Temple Lake Concourse",
                latitude=17.6715,
                longitude=75.9103,
                maps_url="https://www.google.com/maps/search/?api=1&query=17.6715,75.9103",
                total_capacity=80,
                simulated_occupied=35,
                is_demo_data=True,
                rate_car=50.0,
                rate_motorcycle=25.0,
                rate_scooter=25.0,
                rate_other=60.0,
                qr_identifier="OLIVEPARK:SOLAPUR:SIDDHESHWAR_MANDIR:Z1",
                is_active=True
            )
            db.session.add(loc2)

        db.session.commit()

        # Seed 1 initial completed sample session if table is empty, so "My Parking" and "Admin" immediately show rich data
        if ParkingSession.query.count() == 0:
            now = datetime.utcnow()
            sample_session = ParkingSession(
                id=str(uuid.uuid4()),
                session_code="OPK-SOL-901",
                location_id="loc-siddheshwar-mandir",
                vehicle_registration="MH 13 BN 4521",
                vehicle_type="Car",
                vehicle_model="Hyundai Creta",
                driver_name="Rahul Deshmukh",
                driver_phone="9823012345",
                driver_email="rahul.deshmukh@example.com",
                start_time=now - timedelta(hours=3),
                planned_duration_hours=2.0,
                expected_exit_time=now - timedelta(hours=1),
                actual_exit_time=now - timedelta(hours=1),
                billable_hours=2,
                hourly_rate=50.0,
                total_amount=100.0,
                status="COMPLETED"
            )
            db.session.add(sample_session)
            db.session.flush()

            sample_payment = PaymentTransaction(
                id=str(uuid.uuid4()),
                session_id=sample_session.id,
                order_id="order_demo_init_sample",
                payment_id="pay_demo_init_sample",
                amount=100.0,
                currency="INR",
                gateway_mode="DEMO",
                status="SUCCESS",
                verified_at=now - timedelta(hours=3)
            )
            db.session.add(sample_payment)
            db.session.flush()

            sample_receipt = Receipt(
                id=str(uuid.uuid4()),
                receipt_number="RCPT-OPK-2026-0001",
                session_id=sample_session.id,
                payment_transaction_id=sample_payment.id,
                verification_token=f"SEC-{uuid.uuid4().hex[:12].upper()}",
                pdf_filename="receipt_opk_2026_0001.pdf",
                issued_at=now - timedelta(hours=3)
            )
            db.session.add(sample_receipt)
            db.session.commit()
            print("[Seed] Seeded OlivePark AI with 2 Solapur locations and initial verified record.")
        else:
            print("[Seed] Verified 2 Solapur locations exist. Retaining existing sessions.")

if __name__ == "__main__":
    from flask import Flask
    app = Flask(__name__)
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///olivepark.db"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    db.init_app(app)
    seed_database(app)
