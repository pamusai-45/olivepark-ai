import urllib.request
import json

BASE = 'http://127.0.0.1:5000/api'

def req(url, data=None, method=None):
    headers = {'Content-Type': 'application/json'} if data is not None else {}
    body = json.dumps(data).encode('utf-8') if data is not None else None
    r = urllib.request.Request(url, data=body, headers=headers, method=method or ('POST' if data is not None else 'GET'))
    with urllib.request.urlopen(r) as res:
        return json.loads(res.read().decode())

def run_tests():
    print("[1/9] Testing /api/locations...")
    locs = req(f'{BASE}/locations')['data']
    print(f"      Locations count: {len(locs)} -> {[l['name'] for l in locs]}")
    assert len(locs) == 2, "Must have exactly 2 locations"

    print("[2/9] Testing /api/qr/validate for Siddheshwar Mandir...")
    qr_res = req(f'{BASE}/qr/validate', {'qr_data': 'OLIVEPARK:SOLAPUR:SIDDHESHWAR_MANDIR:Z1'})
    assert qr_res['is_valid'] is True
    print(f"      Recognized: {qr_res['location']['name']} ({qr_res['location']['zone_name']})")

    print("[3/9] Testing /api/parking/calculate-fee...")
    fee = req(f'{BASE}/parking/calculate-fee', {
        'location_id': 'loc-siddheshwar-mandir',
        'vehicle_type': 'Car',
        'duration_hours': 2
    })['data']
    print(f"      Calculated Total: INR {fee['total_amount']} for {fee['billable_hours']} billable hours")
    assert fee['total_amount'] == 100.0

    print("[4/9] Testing /api/parking/sessions (Vehicle Check-in)...")
    import uuid
    dynamic_plate = f"MH 13 {uuid.uuid4().hex[:2].upper()} {uuid.uuid4().hex[:4].upper()}"
    sess = req(f'{BASE}/parking/sessions', {
        'location_id': 'loc-siddheshwar-mandir',
        'vehicle_registration': dynamic_plate,
        'vehicle_type': 'Car',
        'driver_name': 'Anand Kulkarni',
        'driver_phone': '9822001122',
        'duration_hours': 2
    })['data']
    print(f"      Session Code: {sess['session_code']} | Plate: {sess['vehicle_registration']} | Status: {sess['status']}")
    assert sess['vehicle_registration'] == dynamic_plate
    assert sess['status'] == 'PENDING_PAYMENT'

    print("[5/9] Testing /api/payments/create-order...")
    ord_data = req(f'{BASE}/payments/create-order', {'session_id': sess['id']})['data']
    print(f"      Order ID: {ord_data['order_id']} | Amount: INR {ord_data['amount']}")
    assert ord_data['amount'] == 100.0

    print("[6/9] Testing /api/payments/verify...")
    rcpt = req(f'{BASE}/payments/verify', {
        'order_id': ord_data['order_id'],
        'payment_id': f"pay_demo_{uuid.uuid4().hex[:10]}"
    })['data']
    print(f"      Payment Verified! Issued Receipt Number: {rcpt['receipt_number']}")
    assert rcpt['receipt_number'].startswith('RCPT-OPK-')

    print("[7/9] Testing /api/receipts/<id>/pdf (Server-side ReportLab Generation)...")
    with urllib.request.urlopen(f"{BASE}/receipts/{rcpt['id']}/pdf") as f:
        pdf_bytes = f.read()
        print(f"      PDF generated successfully! File size: {len(pdf_bytes)} bytes")
        assert len(pdf_bytes) > 2000
        assert pdf_bytes.startswith(b'%PDF-')

    print("[8/9] Testing /api/parking/sessions/<id>/complete (Vehicle Exit)...")
    comp = req(f"{BASE}/parking/sessions/{sess['id']}/complete", {})['data']
    print(f"      Session successfully ended. Final Status: {comp['status']}")
    assert comp['status'] == 'COMPLETED'

    print("[9/9] Testing /api/admin/overview...")
    admin = req(f'{BASE}/admin/overview')
    stats = admin['stats']
    print(f"      Admin Stats -> Revenue: INR {stats['total_revenue']} | Completed: {stats['completed_sessions']} | Active: {stats['active_sessions']}")
    assert stats['total_revenue'] >= 200.0

    print("\n>>> ALL 9 END-TO-END FLOW TESTS PASSED FLAWLESSLY! <<<")

if __name__ == '__main__':
    run_tests()
