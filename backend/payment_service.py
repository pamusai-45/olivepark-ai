import os
import hmac
import hashlib
import uuid
import requests
from typing import Tuple, Dict, Any, Optional

def get_gateway_config() -> Dict[str, Any]:
    key_id = os.getenv("RAZORPAY_KEY_ID", "").strip()
    key_secret = os.getenv("RAZORPAY_KEY_SECRET", "").strip()
    is_live_configured = bool(key_id and key_secret and not key_id.startswith("mock_"))
    
    return {
        "mode": "RAZORPAY_TEST" if is_live_configured else "DEMO",
        "key_id": key_id if is_live_configured else "demo_key_olivepark_solapur",
        "is_demo_mode": not is_live_configured
    }

def create_payment_order(session_id: str, amount_inr: float) -> Tuple[bool, Dict[str, Any], str]:
    """
    Creates an order either via Razorpay API (if credentials present) or in Demo mode.
    Amount in INR is converted to paise for Razorpay.
    """
    cfg = get_gateway_config()
    amount_paise = int(round(amount_inr * 100))

    if cfg["mode"] == "RAZORPAY_TEST":
        try:
            key_id = os.getenv("RAZORPAY_KEY_ID")
            key_secret = os.getenv("RAZORPAY_KEY_SECRET")
            
            resp = requests.post(
                "https://api.razorpay.com/v1/orders",
                auth=(key_id, key_secret),
                json={
                    "amount": amount_paise,
                    "currency": "INR",
                    "receipt": f"rcpt_{session_id[:8]}",
                    "notes": {
                        "system": "OlivePark-AI",
                        "session_id": session_id
                    }
                },
                timeout=10
            )
            if resp.status_code == 200 or resp.status_code == 201:
                order_json = resp.json()
                return True, {
                    "order_id": order_json["id"],
                    "amount": amount_inr,
                    "currency": "INR",
                    "key_id": key_id,
                    "gateway_mode": "RAZORPAY_TEST",
                    "is_demo": False
                }, ""
            else:
                # If Razorpay call failed, log and fallback to Demo mode gracefully
                error_msg = f"Razorpay API error: {resp.text}"
                return False, {}, error_msg
        except Exception as e:
            return False, {}, f"Gateway connection error: {str(e)}"

    # DEMO Payment Mode
    mock_order_id = f"order_demo_{uuid.uuid4().hex[:12]}"
    return True, {
        "order_id": mock_order_id,
        "amount": amount_inr,
        "currency": "INR",
        "key_id": cfg["key_id"],
        "gateway_mode": "DEMO",
        "is_demo": True
    }, ""

def verify_payment_signature(
    order_id: str, 
    payment_id: str, 
    signature: str = None
) -> Tuple[bool, str]:
    """
    Verifies payment completion.
    For Razorpay: checks cryptographic HMAC SHA256 signature.
    For Demo: checks order and payment identifiers are provided and valid.
    """
    cfg = get_gateway_config()

    if cfg["mode"] == "RAZORPAY_TEST":
        key_secret = os.getenv("RAZORPAY_KEY_SECRET", "")
        if not signature:
            return False, "Missing Razorpay payment signature."
        
        try:
            msg = f"{order_id}|{payment_id}".encode("utf-8")
            expected_sig = hmac.new(
                key_secret.encode("utf-8"),
                msg,
                hashlib.sha256
            ).hexdigest()

            if hmac.compare_digest(expected_sig, signature):
                return True, ""
            return False, "Invalid Razorpay payment signature. Verification failed."
        except Exception as e:
            return False, f"Signature verification exception: {str(e)}"

    # Demo Mode Verification
    if not order_id or not payment_id:
        return False, "Missing order ID or payment ID in demo verification."

    if not order_id.startswith("order_demo_"):
        return False, "Invalid demo order identifier."

    return True, ""
