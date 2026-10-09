import math
from typing import Dict, Any, Tuple

DEFAULT_RATES = {
    "Car": 40.0,
    "Motorcycle": 20.0,
    "Scooter": 20.0,
    "Other": 50.0
}

VALID_VEHICLE_TYPES = {"Car", "Motorcycle", "Scooter", "Other"}

def calculate_parking_fee(
    vehicle_type: str, 
    duration_hours: float, 
    location_rates: Dict[str, float] = None
) -> Tuple[bool, Dict[str, Any], str]:
    """
    Calculates the parking fee on the server side based on hourly rates and started hours.
    Billing policy: Every started hour is billed as a full hour. Minimum 1 hour.
    """
    if vehicle_type not in VALID_VEHICLE_TYPES:
        return False, {}, f"Invalid vehicle type '{vehicle_type}'. Must be one of: {', '.join(VALID_VEHICLE_TYPES)}"

    try:
        duration = float(duration_hours)
    except (ValueError, TypeError):
        return False, {}, "Invalid duration value provided. Must be a positive number."

    if duration <= 0:
        return False, {}, "Duration must be greater than zero hours."

    if duration > 168: # Max 7 days for a single session
        return False, {}, "Duration exceeds maximum permissible parking limit (168 hours / 7 days)."

    # Resolve rates
    rates = DEFAULT_RATES.copy()
    if location_rates:
        for v_type, rate in location_rates.items():
            if v_type in rates and rate is not None and rate > 0:
                rates[v_type] = float(rate)

    hourly_rate = rates[vehicle_type]

    # Billing policy: Each started hour is charged (ceil)
    billable_hours = math.ceil(duration)
    if billable_hours < 1:
        billable_hours = 1

    total_amount = round(billable_hours * hourly_rate, 2)

    breakdown = {
        "vehicle_type": vehicle_type,
        "hourly_rate": hourly_rate,
        "input_duration_hours": duration,
        "billable_hours": billable_hours,
        "currency": "INR",
        "currency_symbol": "₹",
        "billing_policy": "Each started hour billed as a full hour (minimum 1 hour)",
        "subtotal": total_amount,
        "tax_amount": 0.0, # Currently direct municipal parking fee without extra surcharge
        "total_amount": total_amount,
        "is_demo_rate": True
    }

    return True, breakdown, ""
