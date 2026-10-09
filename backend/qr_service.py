import os
import json
import qrcode
from io import BytesIO
import base64
from typing import Tuple, Dict, Any, Optional

QR_PAYLOAD_MAP = {
    "loc-kambar-talav": {
        "text_token": "OLIVEPARK:SOLAPUR:KAMBAR_TALAV:Z1",
        "name": "Kambar Talav, Solapur",
        "zone": "Kambar Lake Promenade - Zone A"
    },
    "loc-siddheshwar-mandir": {
        "text_token": "OLIVEPARK:SOLAPUR:SIDDHESHWAR_MANDIR:Z1",
        "name": "Siddheshwar Mandir, Solapur",
        "zone": "Siddheshwar Temple Concourse - Zone B"
    }
}

def generate_location_qr_base64(location_id: str, payload_text: str = None) -> str:
    """Generates a QR code image encoded as Base64 data URI."""
    if not payload_text:
        payload_data = {
            "app": "OlivePark-AI",
            "system": "Smart Parking Solapur",
            "location_id": location_id,
            "token": QR_PAYLOAD_MAP.get(location_id, {}).get("text_token", f"OLIVEPARK:SOLAPUR:{location_id}")
        }
        payload_text = json.dumps(payload_data)

    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=10,
        border=3,
    )
    qr.add_data(payload_text)
    qr.make(fit=True)

    # Style colors matching OlivePark theme: dark olive foreground, cream background
    img = qr.make_image(fill_color="#30372A", back_color="#FFFDF6")
    buffered = BytesIO()
    img.save(buffered, format="PNG")
    img_b64 = base64.b64encode(buffered.getvalue()).decode("utf-8")
    return f"data:image/png;base64,{img_b64}"

def save_location_qr_image(location_id: str, output_path: str) -> str:
    """Saves a QR code PNG to disk."""
    token = QR_PAYLOAD_MAP.get(location_id, {}).get("text_token", f"OLIVEPARK:SOLAPUR:{location_id}")
    payload_data = {
        "app": "OlivePark-AI",
        "system": "Smart Parking Solapur",
        "location_id": location_id,
        "token": token
    }
    payload_text = json.dumps(payload_data)

    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=12,
        border=4,
    )
    qr.add_data(payload_text)
    qr.make(fit=True)

    img = qr.make_image(fill_color="#30372A", back_color="#FFFDF6")
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    img.save(output_path)
    return output_path

def validate_qr_string(scanned_text: str) -> Tuple[bool, Optional[str], Optional[str], str]:
    """
    Validates scanned QR code against allowed locations in Solapur.
    Returns: (is_valid, location_id, zone_name, error_message)
    """
    if not scanned_text or not scanned_text.strip():
        return False, None, None, "Empty QR code data received."

    text = scanned_text.strip()

    # Check 1: Direct JSON payload
    if text.startswith("{") and text.endswith("}"):
        try:
            data = json.loads(text)
            loc_id = data.get("location_id")
            if loc_id in QR_PAYLOAD_MAP:
                zone = QR_PAYLOAD_MAP[loc_id]["zone"]
                return True, loc_id, zone, ""
            return False, None, None, f"QR code contains unrecognized location identifier '{loc_id}'."
        except Exception:
            pass

    # Check 2: Canonical text tokens
    if "KAMBAR_TALAV" in text.upper() or "KAMBAR" in text.upper() or "loc-kambar-talav" in text:
        return True, "loc-kambar-talav", QR_PAYLOAD_MAP["loc-kambar-talav"]["zone"], ""

    if "SIDDHESHWAR" in text.upper() or "MANDIR" in text.upper() or "loc-siddheshwar-mandir" in text:
        return True, "loc-siddheshwar-mandir", QR_PAYLOAD_MAP["loc-siddheshwar-mandir"]["zone"], ""

    return False, None, None, "Invalid or unauthorized QR code. Please scan a valid OlivePark Solapur QR standee."
