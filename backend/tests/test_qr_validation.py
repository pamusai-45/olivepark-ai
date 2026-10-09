import unittest
import sys
import os
import json

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from qr_service import validate_qr_string

class TestQRValidation(unittest.TestCase):
    def test_valid_kambar_talav_token(self):
        ok, loc_id, zone, err = validate_qr_string("OLIVEPARK:SOLAPUR:KAMBAR_TALAV:Z1")
        self.assertTrue(ok)
        self.assertEqual(loc_id, "loc-kambar-talav")
        self.assertIn("Kambar", zone)

    def test_valid_siddheshwar_mandir_token(self):
        ok, loc_id, zone, err = validate_qr_string("OLIVEPARK:SOLAPUR:SIDDHESHWAR_MANDIR:Z1")
        self.assertTrue(ok)
        self.assertEqual(loc_id, "loc-siddheshwar-mandir")
        self.assertIn("Temple", zone)

    def test_valid_json_payload(self):
        payload = json.dumps({"location_id": "loc-kambar-talav", "solapur": True})
        ok, loc_id, zone, err = validate_qr_string(payload)
        self.assertTrue(ok)
        self.assertEqual(loc_id, "loc-kambar-talav")

    def test_invalid_third_location_rejected(self):
        # A third location from another city or random string must be rejected
        ok, loc_id, zone, err = validate_qr_string("OLIVEPARK:PUNE:SHIVAJINAGAR:Z1")
        self.assertFalse(ok)
        self.assertIsNone(loc_id)

    def test_empty_qr(self):
        ok, loc_id, zone, err = validate_qr_string("")
        self.assertFalse(ok)

if __name__ == "__main__":
    unittest.main()
