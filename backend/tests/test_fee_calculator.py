import unittest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from fee_calculator import calculate_parking_fee

class TestFeeCalculator(unittest.TestCase):
    def test_standard_car_fee_calculation(self):
        # 2 hours at Car rate ₹40 = ₹80
        rates = {"Car": 40.0, "Motorcycle": 20.0, "Scooter": 20.0, "Other": 50.0}
        ok, res, err = calculate_parking_fee("Car", 2.0, rates)
        self.assertTrue(ok)
        self.assertEqual(res["billable_hours"], 2)
        self.assertEqual(res["total_amount"], 80.0)

    def test_started_hour_billing_policy(self):
        # 1.25 hours should be rounded up to 2 billable hours
        rates = {"Motorcycle": 20.0}
        ok, res, err = calculate_parking_fee("Motorcycle", 1.25, rates)
        self.assertTrue(ok)
        self.assertEqual(res["billable_hours"], 2)
        self.assertEqual(res["total_amount"], 40.0)

    def test_fractional_sub_hour(self):
        # 0.5 hours should charge minimum 1 billable hour
        rates = {"Scooter": 25.0}
        ok, res, err = calculate_parking_fee("Scooter", 0.5, rates)
        self.assertTrue(ok)
        self.assertEqual(res["billable_hours"], 1)
        self.assertEqual(res["total_amount"], 25.0)

    def test_invalid_vehicle_type(self):
        ok, res, err = calculate_parking_fee("Helicopter", 2.0)
        self.assertFalse(ok)
        self.assertIn("Invalid vehicle type", err)

    def test_zero_or_negative_duration(self):
        ok, res, err = calculate_parking_fee("Car", 0)
        self.assertFalse(ok)
        ok2, res2, err2 = calculate_parking_fee("Car", -3.5)
        self.assertFalse(ok2)

if __name__ == "__main__":
    unittest.main()
