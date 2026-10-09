import unittest
import sys
import os
import json

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from app import app, db
from models import ParkingLocation, ParkingSession, PaymentTransaction, Receipt

class TestParkingFlow(unittest.TestCase):
    def setUp(self):
        app.config["TESTING"] = True
        app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"
        self.client = app.test_client()
        with app.app_context():
            db.create_all()
            from seed import seed_database
            seed_database(app)

    def tearDown(self):
        with app.app_context():
            db.session.remove()
            db.drop_all()

    def test_only_two_locations_returned(self):
        res = self.client.get("/api/locations")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()["data"]
        self.assertEqual(len(data), 2)
        loc_ids = {l["id"] for l in data}
        self.assertEqual(loc_ids, {"loc-kambar-talav", "loc-siddheshwar-mandir"})

    def test_prevent_third_location_creation(self):
        res = self.client.post("/api/admin/locations", json={"name": "Third Location"})
        self.assertEqual(res.status_code, 403)

    def test_full_checkin_and_duplicate_prevention(self):
        # 1. Create a session
        payload = {
            "location_id": "loc-kambar-talav",
            "vehicle_registration": "mh-13-ab-1234",
            "vehicle_type": "Car",
            "driver_name": "Test Driver",
            "driver_phone": "9876543210",
            "duration_hours": 2
        }
        res = self.client.post("/api/parking/sessions", json=payload)
        self.assertEqual(res.status_code, 201)
        sess = res.get_json()["data"]
        self.assertEqual(sess["vehicle_registration"], "MH 13 AB 1234")
        self.assertEqual(sess["status"], "PENDING_PAYMENT")
        self.assertEqual(sess["total_amount"], 80.0)

        # 2. Simulate payment order
        res_order = self.client.post("/api/payments/create-order", json={"session_id": sess["id"]})
        self.assertEqual(res_order.status_code, 200)
        order = res_order.get_json()["data"]

        # 3. Verify payment
        res_verify = self.client.post("/api/payments/verify", json={
            "order_id": order["order_id"],
            "payment_id": "pay_demo_test_123"
        })
        self.assertEqual(res_verify.status_code, 200)
        receipt = res_verify.get_json()["data"]
        self.assertTrue(receipt["receipt_number"].startswith("RCPT-OPK-"))

        # 4. Attempting duplicate active session with same vehicle at same location should fail
        res_dup = self.client.post("/api/parking/sessions", json=payload)
        self.assertEqual(res_dup.status_code, 409)

if __name__ == "__main__":
    unittest.main()
