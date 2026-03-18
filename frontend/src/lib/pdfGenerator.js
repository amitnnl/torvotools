import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * Utility to generate a professional industrial PDF
 * @param {Object} options - Configuration for the PDF
 */
export const generateIndustrialPDF = ({
    type = 'INVOICE',
    documentNumber,
    date,
    customer,
    items,
    totals,
    settings,
    status = 'PENDING',
    signature = null
}) => {
    const doc = new jsPDF();
    const primaryColor = [2, 132, 199];
    const secondaryColor = [17, 24, 39];
    const slateColor = [100, 116, 139];

    // --- Background Watermark ---
    doc.setTextColor(241, 245, 249);
    doc.setFontSize(60);
    doc.setFont('helvetica', 'bold');
    doc.text('OFFICIAL TORVO DOCUMENT', 105, 150, { align: 'center', angle: 45 });

    // --- Header ---
    doc.setFillColor(...secondaryColor);
    doc.rect(0, 0, 210, 45, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(26);
    doc.setFont('helvetica', 'bold');
    doc.text('TORVO TOOLS', 15, 22);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    const headerSub = 'PROFESSIONAL GRADE INDUSTRIAL SYSTEMS - ISO 9001:2015 CERTIFIED';
    doc.text(headerSub.toUpperCase(), 15, 30);

    // Status Badge
    const statusColor = status.toUpperCase() === 'PAID' ? [34, 197, 94] : [245, 158, 11];
    doc.setFillColor(...statusColor);
    doc.rect(160, 15, 35, 8, 'F');
    doc.setFontSize(7);
    doc.setTextColor(255, 255, 255);
    doc.text(status.toUpperCase(), 177.5, 20.5, { align: 'center' });

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(type, 195, 35, { align: 'right' });

    // --- Document Meta ---
    doc.setTextColor(...slateColor);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('DOCUMENT TOKEN', 15, 55);
    doc.text('MANIFEST DATE', 15, 60);

    doc.setTextColor(...secondaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text(documentNumber.toUpperCase(), 50, 55);
    doc.text(date.toUpperCase(), 50, 60);

    // --- Entity Section ---
    doc.setDrawColor(241, 245, 249);
    doc.line(15, 68, 195, 68);

    doc.setTextColor(...slateColor);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text('ORIGIN HUB:', 15, 75);
    doc.text('DEPLOYMENT RECIPIENT:', 105, 75);

    doc.setTextColor(...secondaryColor);
    doc.setFontSize(9);
    doc.text(settings?.website_title || 'TORVO TOOLS INDUSTRIAL HUB', 15, 82);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    const addressLines = (settings?.contact_address || '123 INDUSTRIAL PARKWAY, SUITE 500, LOGISTICS HUB, GLOBAL-ID-001').split(',');
    addressLines.forEach((line, i) => doc.text(line.trim().toUpperCase(), 15, 87 + (i * 3.5)));

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(customer.name.toUpperCase() || 'VALUED PARTNER', 105, 82);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    const shipLines = doc.splitTextToSize(customer.address.toUpperCase() || 'LOGISTICS ADDRESS PENDING PROTOCOL VALIDATION', 90);
    doc.text(shipLines, 105, 87);

    // --- Equipment Table ---
    const tableData = items.map(item => [
        item.product_name || item.name,
        item.quantity.toString(),
        `${settings?.currency_symbol || '₹'}${parseFloat(item.price).toLocaleString()}`,
        `${settings?.currency_symbol || '₹'}${(item.quantity * item.price).toLocaleString()}`
    ]);

    doc.autoTable({
        startY: 110,
        head: [['PROCUREMENT DESIGNATION', 'UNITS', 'UNIT VALUATION', 'NET VALUATION']],
        body: tableData,
        theme: 'grid',
        headStyles: {
            fillColor: secondaryColor,
            textColor: [255, 255, 255],
            fontSize: 8,
            fontStyle: 'bold',
            halign: 'left',
            cellPadding: 4
        },
        bodyStyles: {
            fontSize: 7,
            textColor: secondaryColor,
            cellPadding: 3
        },
        columnStyles: {
            1: { halign: 'center', width: 25 },
            2: { halign: 'right', width: 40 },
            3: { halign: 'right', width: 40 }
        }
    });

    // --- Procurement Math ---
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(8);
    doc.setTextColor(...slateColor);
    doc.text('SUBTOTAL:', 140, finalY);
    doc.text('GOVERNMENT TAX / GST:', 140, finalY + 5);

    doc.setFontSize(14);
    doc.setTextColor(...primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL PAYABLE:', 140, finalY + 15);

    doc.setFontSize(8);
    doc.setTextColor(...secondaryColor);
    doc.text(`${settings?.currency_symbol || '₹'}${parseFloat(totals.subtotal).toLocaleString()}`, 195, finalY, { align: 'right' });
    doc.text(`${settings?.currency_symbol || '₹'}${parseFloat(totals.tax).toLocaleString()}`, 195, finalY + 5, { align: 'right' });

    doc.setFontSize(14);
    doc.setTextColor(...primaryColor);
    doc.text(`${settings?.currency_symbol || '₹'}${parseFloat(totals.total).toLocaleString()}`, 195, finalY + 15, { align: 'right' });

    // --- Verification Protocols & Signs ---
    const signY = 240;
    doc.setDrawColor(241, 245, 249);
    doc.line(15, signY - 10, 195, signY - 10);

    doc.setTextColor(...slateColor);
    doc.setFontSize(6);
    doc.text('OPERATIONAL VERIFICATION SIGNATURE', 15, signY);
    doc.text('RECIPIENT ACKNOWLEDGEMENT', 130, signY);

    doc.setDrawColor(200, 200, 200);
    doc.line(15, signY + 15, 75, signY + 15);
    doc.line(130, signY + 15, 190, signY + 15);

    if (signature) {
        doc.addImage(signature, 'PNG', 135, signY - 5, 50, 20);
    }

    // --- Terms & Conditions ---
    const termsY = 265;
    doc.setFontSize(6);
    doc.setTextColor(...slateColor);
    const terms = [
        "1. ALL EQUIPMENT REMAINS TORVO TOOLS PROPERTY UNTIL FULL CAPITAL TRANSMISSION IS CONFIRMED.",
        "2. TECHNICAL SUPPORT PROTOCOLS ARE SUBJECT TO ACTIVE SERVICE LEVEL AGREEMENTS (SLA).",
        "3. WARRANTY CLAIMS REQUIRE THE ORIGINAL MANIFEST AND SERIAL NUMBER VALIDATION.",
        "4. DISPUTES ARE SUBJECT TO INDUSTRIAL ARBITRATION WITHIN THE REGISTERED JURISDICTION."
    ];
    terms.forEach((line, i) => doc.text(line, 15, termsY + (i * 3)));

    // --- Footer ---
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFillColor(248, 250, 252);
        doc.rect(0, 285, 210, 15, 'F');
        doc.setFontSize(6);
        doc.setTextColor(...slateColor);
        doc.text('CERTIFIED INDUSTRIAL MANIFEST - TORVO SECURE PROTOCOL - ENCRYPTID: TRV-884-X', 105, 292, { align: 'center' });
        doc.setFontSize(5);
        doc.text(`PAGE ${i} OF ${pageCount} | GENERATED VIA TORVO NEXUS CORE`, 195, 292, { align: 'right' });
    }

    doc.save(`${type}_${documentNumber}.pdf`);
};

export const generateShippingManifestPDF = (shipment, settings) => {
    generateIndustrialPDF({
        type: 'LOGISTICS MANIFEST',
        documentNumber: shipment.tracking_number,
        date: new Date(shipment.created_at).toLocaleDateString(),
        customer: {
            name: shipment.site_contact_name || 'HUB RECIPIENT',
            address: shipment.site_coordinates || 'SITE COORDINATES PENDING'
        },
        items: [
            { product_name: 'Industrial Logistics Unit', quantity: 1, price: 0 }
        ],
        totals: {
            subtotal: 0,
            tax: 0,
            total: 0
        },
        status: shipment.shipping_status || 'MANIFESTED',
        settings,
        signature: shipment.digital_signature // Pass signature
    });
};

export const generateInvoicePDF = (order, settings) => {
    generateIndustrialPDF({
        type: 'INVOICE',
        documentNumber: `ORD-${order.id}`,
        date: new Date(order.created_at).toLocaleDateString(),
        customer: {
            name: order.user_name || 'PARTNER',
            address: order.shipping_address || 'HUB'
        },
        items: order.items || [],
        totals: {
            subtotal: parseFloat(order.total_amount) - (parseFloat(order.gst_amount) || 0),
            tax: order.gst_amount || 0,
            total: order.total_amount
        },
        status: order.status || 'PENDING',
        settings
    });
};

export const generateQuotePDF = (rfq, settings) => {
    generateIndustrialPDF({
        type: 'QUOTATION',
        documentNumber: `RFQ-${rfq.id}`,
        date: new Date(rfq.created_at).toLocaleDateString(),
        customer: {
            name: rfq.user_name || 'VALUED PARTNER',
            address: rfq.site_location || 'CONTACT HUB FOR DEPLOYMENT'
        },
        items: [{
            product_name: rfq.product_name,
            quantity: rfq.quantity,
            price: rfq.quoted_price || 0
        }],
        totals: {
            subtotal: (rfq.quoted_price || 0) * rfq.quantity,
            tax: 0,
            total: (rfq.quoted_price || 0) * rfq.quantity
        },
        status: 'QUOTED',
        settings
    });
};
