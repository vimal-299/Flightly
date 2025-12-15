import jsPDF from 'jspdf';

interface TicketData {
    passengerName: string;
    passengerEmail: string;
    airline: string;
    flightId: number;
    from: string;
    to: string;
    price: number;
    date: string;
    pnr: string;
}

export const generateTicketPDF = (data: TicketData) => {
    const doc = new jsPDF();

    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('Flightly Ticket', 105, 25, { align: 'center' });

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);

    let y = 60;
    const lineHeight = 10;

    doc.setFont('helvetica', 'bold');
    doc.text('Passenger Details', 20, y);
    y += lineHeight;
    doc.setFont('helvetica', 'normal');
    doc.text(`Name: ${data.passengerName}`, 20, y);
    y += lineHeight;
    doc.text(`Email: ${data.passengerEmail}`, 20, y);
    y += lineHeight * 2;

    doc.setFont('helvetica', 'bold');
    doc.text('Flight Details', 20, y);
    y += lineHeight;
    doc.setFont('helvetica', 'normal');
    doc.text(`Airline: ${data.airline}`, 20, y);
    y += lineHeight;
    doc.text(`Flight ID: ${data.flightId}`, 20, y);
    y += lineHeight;
    doc.text(`Route: ${data.from} -> ${data.to}`, 20, y);
    y += lineHeight;
    doc.text(`Date: ${new Date(data.date).toLocaleString()}`, 20, y);
    y += lineHeight * 2;

    doc.setFont('helvetica', 'bold');
    doc.text('Booking Details', 20, y);
    y += lineHeight;
    doc.setFont('helvetica', 'normal');
    doc.text(`PNR: ${data.pnr}`, 20, y);
    y += lineHeight;
    doc.text(`Price Paid: Rs. ${data.price}`, 20, y);

    // Footer
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Thank you for flying with Flightly!', 105, 280, { align: 'center' });

    doc.save(`Ticket_${data.pnr}.pdf`);
};
