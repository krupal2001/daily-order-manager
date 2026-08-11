import { Product, Shopkeeper, DailyEntry, AppDataBackup } from '../types';
import { exportBackup } from './storageService';
import { formatDisplayDate } from './calculationService';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function downloadFile(content: string, filename: string, contentType: string) {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportToCSV(filename: string, rows: (string | number)[][]) {
  const csvContent = rows
    .map((row) =>
      row
        .map((field) => {
          const str = String(field ?? '');
          if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        })
        .join(',')
    )
    .join('\n');

  downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
}

export function exportDailyReportCSV(
  date: string,
  entries: DailyEntry[],
  shopkeepers: Shopkeeper[],
  products: Product[]
) {
  const headers = ['Shopkeeper Name', ...products.map((p) => p.name), 'Total Qty', 'Total Amount (Rs.)'];
  const rows: (string | number)[][] = [headers];

  const activeProducts = products.filter((p) => p.active);
  const activeShopkeepers = shopkeepers.filter((s) => s.active);

  const productTotals: Record<string, number> = {};
  activeProducts.forEach((p) => (productTotals[p.id] = 0));

  let grandTotalQty = 0;
  let grandTotalAmount = 0;

  activeShopkeepers.forEach((sk) => {
    const entry = entries.find((e) => e.shopkeeperId === sk.id && e.date === date);
    const row: (string | number)[] = [sk.name];

    activeProducts.forEach((prod) => {
      const item = entry?.items.find((i) => i.productId === prod.id);
      const qty = item ? item.quantity : 0;
      row.push(qty || '—');
      productTotals[prod.id] = (productTotals[prod.id] || 0) + qty;
    });

    const rowQty = entry ? entry.totalQuantity : 0;
    const rowAmt = entry ? entry.totalAmount : 0;
    row.push(rowQty);
    row.push(rowAmt);

    grandTotalQty += rowQty;
    grandTotalAmount += rowAmt;

    rows.push(row);
  });

  // Add Grand Total row
  const totalRow: (string | number)[] = ['TOTAL'];
  activeProducts.forEach((prod) => {
    totalRow.push(productTotals[prod.id] || 0);
  });
  totalRow.push(grandTotalQty);
  totalRow.push(grandTotalAmount);
  rows.push(totalRow);

  exportToCSV(`Daily_Order_Book_${date}.csv`, rows);
}

/**
 * Generates and downloads crisp PDF document for the Daily Order Book.
 */
export function exportDailyReportPDF(
  date: string,
  entries: DailyEntry[],
  shopkeepers: Shopkeeper[],
  products: Product[]
) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const activeProducts = products.filter((p) => p.active);
  const activeShopkeepers = shopkeepers.filter((s) => s.active);

  // Title & Header
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('DAILY ORDER BOOK - PURCHASE & SALES LEDGER', 14, 15);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`DATE: ${formatDisplayDate(date)}`, 14, 22);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 200, 22);

  // Line separator
  doc.setLineWidth(0.5);
  doc.line(14, 25, 283, 25);

  // Table Headers
  const tableHead = [
    ['Shopkeeper Name', ...activeProducts.map((p) => p.name), 'Total Qty', 'Total Amount (Rs.)'],
  ];

  const productTotals: Record<string, number> = {};
  activeProducts.forEach((p) => (productTotals[p.id] = 0));

  let grandTotalQty = 0;
  let grandTotalAmt = 0;

  const tableBody: (string | number)[][] = activeShopkeepers.map((sk) => {
    const entry = entries.find((e) => e.shopkeeperId === sk.id && e.date === date);
    const row: (string | number)[] = [sk.name];

    activeProducts.forEach((prod) => {
      const item = entry?.items.find((i) => i.productId === prod.id);
      const qty = item ? item.quantity : 0;
      row.push(qty > 0 ? qty : '—');
      productTotals[prod.id] = (productTotals[prod.id] || 0) + qty;
    });

    const rowQty = entry ? entry.totalQuantity : 0;
    const rowAmt = entry ? entry.totalAmount : 0;
    row.push(rowQty);
    row.push(`Rs. ${rowAmt.toLocaleString('en-IN')}`);

    grandTotalQty += rowQty;
    grandTotalAmt += rowAmt;

    return row;
  });

  // Footer / Total Row
  const tableFoot = [
    [
      'GRAND TOTAL',
      ...activeProducts.map((p) => productTotals[p.id] || 0),
      grandTotalQty,
      `Rs. ${grandTotalAmt.toLocaleString('en-IN')}`,
    ],
  ];

  autoTable(doc, {
    startY: 28,
    head: tableHead,
    body: tableBody,
    foot: tableFoot,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
    },
    footStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
      halign: 'center',
    },
    columnStyles: {
      0: { halign: 'left', fontStyle: 'bold' },
      [tableHead[0].length - 1]: { halign: 'right', fontStyle: 'bold' },
    },
  });

  // Signature / Notes
  const finalY = (doc as any).lastAutoTable?.finalY || 160;
  if (finalY < 180) {
    doc.setFontSize(9);
    doc.text('Notes / Remarks: ___________________________________________________________', 14, finalY + 15);
    doc.text('Authorized Signature: _______________________', 200, finalY + 15);
  }

  doc.save(`Daily_Order_Book_${date}.pdf`);
}

/**
 * Export Product Summary Report as PDF.
 */
export function exportProductReportPDF(
  productData: { name: string; unit: string; totalQty: number; totalAmount: number }[]
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('PRODUCT SALES SUMMARY REPORT', 14, 15);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 22);

  const head = [['Product Name', 'Unit', 'Total Quantity Sold', 'Total Revenue Amount']];
  const body = productData.map((p) => [
    p.name,
    p.unit.toUpperCase(),
    p.totalQty,
    `Rs. ${p.totalAmount.toLocaleString('en-IN')}`,
  ]);

  autoTable(doc, {
    startY: 26,
    head,
    body,
    theme: 'striped',
    headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 9.5, cellPadding: 3.5 },
    columnStyles: {
      2: { halign: 'center', fontStyle: 'bold' },
      3: { halign: 'right', fontStyle: 'bold' },
    },
  });

  doc.save(`Product_Sales_Report_${new Date().toISOString().split('T')[0]}.pdf`);
}

/**
 * Export Shopkeeper Summary Report as PDF.
 */
export function exportShopkeeperReportPDF(
  shopkeeperData: { name: string; orderCount: number; totalQty: number; totalAmount: number }[]
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('SHOPKEEPER PURCHASE PERFORMANCE REPORT', 14, 15);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 22);

  const head = [['Shopkeeper Name', 'Orders Recorded', 'Total Items Purchased', 'Total Purchase Amount']];
  const body = shopkeeperData.map((s) => [
    s.name,
    s.orderCount,
    s.totalQty,
    `Rs. ${s.totalAmount.toLocaleString('en-IN')}`,
  ]);

  autoTable(doc, {
    startY: 26,
    head,
    body,
    theme: 'striped',
    headStyles: { fillColor: [124, 58, 237], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 9.5, cellPadding: 3.5 },
    columnStyles: {
      1: { halign: 'center' },
      2: { halign: 'center', fontStyle: 'bold' },
      3: { halign: 'right', fontStyle: 'bold' },
    },
  });

  doc.save(`Shopkeeper_Performance_Report_${new Date().toISOString().split('T')[0]}.pdf`);
}

export function exportJSONBackup() {
  const backupData: AppDataBackup = exportBackup();
  const jsonStr = JSON.stringify(backupData, null, 2);
  const filename = `Order_Manager_Backup_${new Date().toISOString().split('T')[0]}.json`;
  downloadFile(jsonStr, filename, 'application/json');
}

export function triggerPrint() {
  window.print();
}
