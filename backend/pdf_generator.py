import os
import io
import qrcode
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, HRFlowable
from reportlab.lib.units import inch

def generate_receipt_pdf(receipt_data: dict, output_path: str = None) -> bytes:
    """
    Generates a professional, branded PDF receipt using ReportLab.
    receipt_data expected keys:
      - receipt_number: str
      - session_code: str
      - location_name: str
      - location_address: str
      - vehicle_registration: str
      - vehicle_type: str
      - driver_name: str
      - driver_phone: str
      - driver_email: str
      - start_time: str
      - expected_exit_time: str
      - duration_hours: float
      - billable_hours: int
      - hourly_rate: float
      - total_amount: float
      - order_id: str
      - payment_id: str
      - gateway_mode: str
      - payment_status: str
      - issued_at: str
      - verification_url: str
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    story = []
    styles = getSampleStyleSheet()

    # Brand Colors
    color_primary = colors.HexColor("#7B8450")      # Olive Green
    color_dark = colors.HexColor("#30372A")         # Forest Dark
    color_muted = colors.HexColor("#777A69")        # Muted Olive
    color_card = colors.HexColor("#FFFDF6")         # Ivory
    color_border = colors.HexColor("#E5E5D5")       # Soft Border
    color_accent = colors.HexColor("#DDE4C7")       # Light Sage
    color_success = colors.HexColor("#4D7C50")      # Deep Green

    # Custom Typography Styles
    style_brand = ParagraphStyle(
        "BrandHeader",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=24,
        textColor=color_primary,
        spaceAfter=2
    )

    style_tagline = ParagraphStyle(
        "Tagline",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=10,
        textColor=color_muted,
        spaceAfter=15
    )

    style_title = ParagraphStyle(
        "ReceiptTitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=16,
        textColor=color_dark,
        alignment=2 # Right align
    )

    style_meta_right = ParagraphStyle(
        "MetaRight",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        textColor=color_muted,
        alignment=2
    )

    style_label = ParagraphStyle(
        "CellLabel",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=9,
        textColor=color_muted
    )

    style_val = ParagraphStyle(
        "CellValue",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=10,
        textColor=color_dark
    )

    style_val_bold = ParagraphStyle(
        "CellValueBold",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=11,
        textColor=color_dark
    )

    style_badge = ParagraphStyle(
        "BadgeSuccess",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=10,
        textColor=color_success
    )

    # 1. Header Section: Brand on Left, Receipt Info on Right
    header_data = [
        [
            Paragraph("<b>OlivePark AI</b>", style_brand),
            Paragraph("PARKING RECEIPT", style_title)
        ],
        [
            Paragraph("Smart Parking Solapur, Maharashtra<br/><i>Park Smarter. Pay Seamlessly.</i>", style_tagline),
            Paragraph(f"<b>Receipt No:</b> {receipt_data.get('receipt_number', 'N/A')}<br/>"
                      f"<b>Date:</b> {receipt_data.get('issued_at', datetime.utcnow().strftime('%Y-%m-%d %H:%M'))}<br/>"
                      f"<b>Status:</b> <font color='#4D7C50'><b>PAID &amp; VERIFIED</b></font>", style_meta_right)
        ]
    ]

    header_table = Table(header_data, colWidths=[3.8 * inch, 3.7 * inch])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
        ('TOPPADDING', (0, 0), (-1, -1), 0),
    ]))
    story.append(header_table)
    story.append(Spacer(1, 15))
    story.append(HRFlowable(width="100%", thickness=1.5, color=color_primary, spaceBefore=0, spaceAfter=15))

    # 2. Location & Vehicle Summary Card
    loc_name = receipt_data.get("location_name", "Solapur Municipal Parking")
    loc_address = receipt_data.get("location_address", "Solapur, Maharashtra")
    veh_reg = receipt_data.get("vehicle_registration", "N/A")
    veh_type = receipt_data.get("vehicle_type", "Car")
    driver_name = receipt_data.get("driver_name", "Driver")
    driver_phone = receipt_data.get("driver_phone", "N/A")

    details_data = [
        [
            Paragraph("<b>PARKING LOCATION</b>", style_label),
            Paragraph("<b>VEHICLE &amp; DRIVER</b>", style_label)
        ],
        [
            Paragraph(f"<b>{loc_name}</b><br/>{loc_address}", style_val),
            Paragraph(f"<b>{veh_reg}</b> ({veh_type})<br/>Driver: {driver_name} | {driver_phone}", style_val)
        ],
        [
            Paragraph("<b>PARKING TIMINGS</b>", style_label),
            Paragraph("<b>BILLABLE DURATION</b>", style_label)
        ],
        [
            Paragraph(f"Entry: {receipt_data.get('start_time', 'N/A')}<br/>Valid Until: {receipt_data.get('expected_exit_time', 'N/A')}", style_val),
            Paragraph(f"{receipt_data.get('billable_hours', 1)} Hour(s) billed (@ ₹{receipt_data.get('hourly_rate', 40):.2f}/hr)<br/>Requested: {receipt_data.get('duration_hours', 1)} hr(s)", style_val)
        ]
    ]

    details_table = Table(details_data, colWidths=[3.75 * inch, 3.75 * inch])
    details_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#F9F8F1")),
        ('BOX', (0, 0), (-1, -1), 1, color_border),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, color_border),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 12),
        ('RIGHTPADDING', (0, 0), (-1, -1), 12),
    ]))
    story.append(details_table)
    story.append(Spacer(1, 15))

    # 3. Itemized Fee Breakdown Table
    total_amt = receipt_data.get("total_amount", 0.0)
    hourly_rate = receipt_data.get("hourly_rate", 0.0)
    billable_hours = receipt_data.get("billable_hours", 1)

    items_data = [
        [
            Paragraph("<b>Item Description</b>", style_label),
            Paragraph("<b>Rate / Hr</b>", style_label),
            Paragraph("<b>Units</b>", style_label),
            Paragraph("<b>Amount (INR)</b>", style_label)
        ],
        [
            Paragraph(f"Smart Parking Fee ({veh_type}) - Solapur Zone", style_val),
            Paragraph(f"₹ {hourly_rate:.2f}", style_val),
            Paragraph(f"{billable_hours} hr(s)", style_val),
            Paragraph(f"₹ {total_amt:.2f}", style_val_bold)
        ],
        [
            Paragraph("Municipal Cess / GST (Included)", style_val),
            Paragraph("-", style_val),
            Paragraph("-", style_val),
            Paragraph("₹ 0.00", style_val)
        ],
        [
            Paragraph("<b>TOTAL PAID</b>", style_val_bold),
            "",
            "",
            Paragraph(f"<b>₹ {total_amt:.2f}</b>", ParagraphStyle("BigTotal", parent=style_val_bold, fontSize=14, textColor=color_primary))
        ]
    ]

    items_table = Table(items_data, colWidths=[3.8 * inch, 1.2 * inch, 1.0 * inch, 1.5 * inch])
    items_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), color_accent),
        ('LINEBELOW', (0, 0), (-1, 0), 1, color_primary),
        ('LINEBELOW', (0, 1), (-1, -2), 0.5, color_border),
        ('BACKGROUND', (0, -1), (-1, -1), colors.HexColor("#EAEEDB")),
        ('TOPPADDING', (0, 0), (-1, -1), 7),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 7),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
        ('ALIGN', (1, 0), (-1, -1), 'RIGHT'),
    ]))
    story.append(items_table)
    story.append(Spacer(1, 15))

    # 4. Payment Verification & Verification QR Section
    # Generate verification QR image
    verif_url = receipt_data.get("verification_url", f"https://olivepark.solapur.gov.in/verify/{receipt_data.get('receipt_number', '000')}")
    qr = qrcode.QRCode(version=1, box_size=4, border=1)
    qr.add_data(verif_url)
    qr.make(fit=True)
    qr_img = qr.make_image(fill_color="#30372A", back_color="#FFFDF6")
    qr_buffer = io.BytesIO()
    qr_img.save(qr_buffer, format="PNG")
    qr_buffer.seek(0)

    reportlab_qr = Image(qr_buffer, width=1.1 * inch, height=1.1 * inch)

    gateway_mode = receipt_data.get("gateway_mode", "DEMO")
    order_id = receipt_data.get("order_id", "N/A")
    payment_id = receipt_data.get("payment_id", "N/A")

    payment_info = [
        [
            Paragraph(
                f"<b>Payment Mode:</b> {gateway_mode} ({'Simulated Verified' if gateway_mode == 'DEMO' else 'Razorpay Test'})<br/>"
                f"<b>Order Reference:</b> {order_id}<br/>"
                f"<b>Payment Reference:</b> {payment_id}<br/>"
                f"<b>Session Code:</b> {receipt_data.get('session_code', 'N/A')}<br/>"
                f"<b>Verification Security Token:</b> {receipt_data.get('verification_token', 'SEC-OK')[:18]}...",
                style_val
            ),
            reportlab_qr
        ]
    ]

    payment_table = Table(payment_info, colWidths=[6.2 * inch, 1.3 * inch])
    payment_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#FDFDF9")),
        ('BOX', (0, 0), (-1, -1), 0.5, color_border),
        ('PADDING', (0, 0), (-1, -1), 10),
    ]))
    story.append(payment_table)
    story.append(Spacer(1, 15))

    # 5. Terms / Footer
    footer_text = Paragraph(
        "<i>Notice: Please display this digital or printed pass on dashboard or keep available on your device during exit verification. "
        "Overstay beyond valid until time may incur standard municipal extension fees. Supported parking zones: Kambar Talav and Siddheshwar Mandir, Solapur.</i>",
        ParagraphStyle("Notice", parent=styles["Normal"], fontName="Helvetica", fontSize=8, textColor=color_muted, alignment=1)
    )
    story.append(footer_text)

    doc.build(story)
    pdf_bytes = buffer.getvalue()
    buffer.close()

    if output_path:
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        with open(output_path, "wb") as f:
            f.write(pdf_bytes)

    return pdf_bytes
