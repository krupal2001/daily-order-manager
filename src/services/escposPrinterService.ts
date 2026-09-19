/**
 * ESC/POS & Web Bluetooth Printer Service for 58mm Thermal Mobile Printers
 * (Shreyans Mini Mobile / BillPro 583 / POS-58 / PT-210 / Bluetooth Printers)
 */

import { Shopkeeper, Product, DailyEntry } from '../types';
import { formatDisplayDate } from './calculationService';

// Format plain text receipt for ESC/POS printing (32 columns max for 58mm)
export function generateReceiptPlainText(
  date: string,
  shopkeeper: Shopkeeper,
  items: { productId: string; quantity: number; price: number }[],
  products: Product[],
  adjustment: number = 0
): string {
  const line = '--------------------------------\n';
  const doubleLine = '================================\n';
  const billNumber = `BILL-${date.replace(/-/g, '')}-${shopkeeper.id.replace(/[^a-zA-Z0-9]/g, '').slice(-4).toUpperCase()}`;
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  let text = '';
  text += '      DAILY ORDER MANAGER       \n';
  text += '     DELIVERY ORDER RECEIPT     \n';
  text += line;
  text += `Bill No : ${billNumber}\n`;
  text += `Date    : ${formatDisplayDate(date)}\n`;
  text += `Time    : ${currentTime}\n`;
  text += line;
  text += `To: ${shopkeeper.name}\n`;
  if (shopkeeper.phone) text += `Ph: ${shopkeeper.phone}\n`;
  if (shopkeeper.address) text += `Addr: ${shopkeeper.address}\n`;
  text += line;
  text += 'ITEM             QTY  RATE   AMT\n';
  text += line;

  let subtotal = 0;
  let totalQty = 0;

  items.forEach((item) => {
    if (item.quantity <= 0) return;
    const prod = products.find((p) => p.id === item.productId);
    const prodName = (prod ? prod.name : 'Item').substring(0, 14).padEnd(14, ' ');
    const qtyStr = String(item.quantity).padStart(4, ' ');
    const rateStr = String(item.price).padStart(5, ' ');
    const amt = item.quantity * item.price;
    subtotal += amt;
    totalQty += item.quantity;
    const amtStr = String(amt).padStart(6, ' ');

    text += `${prodName} ${qtyStr} ${rateStr} ${amtStr}\n`;
  });

  text += line;
  text += `TOTAL QTY   : ${String(totalQty).padStart(17, ' ')}\n`;
  text += `SUBTOTAL    : ₹${String(subtotal).padStart(16, ' ')}\n`;
  if (adjustment !== 0) {
    const adjSign = adjustment > 0 ? '+' : '';
    text += `ADJUSTMENT  : ${adjSign}₹${String(adjustment).padStart(15, ' ')}\n`;
  }
  text += doubleLine;
  const netTotal = subtotal + adjustment;
  text += `NET TOTAL   : ₹${String(netTotal).padStart(16, ' ')}\n`;
  text += doubleLine;
  text += '\n';
  text += '     Thank You! Visit Again.    \n';
  text += '\n\n';

  return text;
}

/**
 * Method 1: Print via RawBT Android App Intent (Works with ALL 58mm Bluetooth Printers)
 * RawBT is the standard ESC/POS driver app on Android for Bluetooth receipt printers.
 */
export function printViaRawBT(text: string): boolean {
  try {
    const encodedText = encodeURIComponent(text);
    // Launch RawBT intent scheme
    window.location.href = `intent:${encodedText}#Intent;scheme=rawbt;package=ru.a2ol.rawbtprinter;S.title=DailyOrderManagerBill;end;`;
    return true;
  } catch (err) {
    console.error('RawBT print error:', err);
    return false;
  }
}

/**
 * Method 2: Direct Web Bluetooth Printing (No third-party app needed)
 * Uses browser navigator.bluetooth to connect directly to Shreyans / POS-58 printer.
 */
export async function printViaWebBluetooth(text: string): Promise<{ success: boolean; message: string }> {
  if (!('bluetooth' in navigator)) {
    return {
      success: false,
      message: 'Web Bluetooth is not supported in this browser. Please use Chrome on Android/Desktop or try RawBT.',
    };
  }

  try {
    // Request Bluetooth device with Serial Port / Printer Service UUIDs
    const device = await (navigator as any).bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: [
        '000018f0-0000-1000-8000-00805f9b34fb', // Standard ESC/POS Service
        '49535343-fe7d-4ae5-8fa9-9fafd205e455', // Microchip / POS Service
        '00001101-0000-1000-8000-00805f9b34fb', // Serial Port Profile
        '0000af00-0000-1000-8000-00805f9b34fb',
      ],
    });

    if (!device || !device.gatt) {
      return { success: false, message: 'No Bluetooth printer selected.' };
    }

    const server = await device.gatt.connect();

    // Find printable characteristic
    const services = await server.getPrimaryServices();
    let writeCharacteristic = null;

    for (const service of services) {
      const characteristics = await service.getCharacteristics();
      for (const char of characteristics) {
        if (char.properties.write || char.properties.writeWithoutResponse) {
          writeCharacteristic = char;
          break;
        }
      }
      if (writeCharacteristic) break;
    }

    if (!writeCharacteristic) {
      device.gatt.disconnect();
      return { success: false, message: 'Could not find writable printer service on device.' };
    }

    // Convert text to ESC/POS binary buffer
    const encoder = new TextEncoder();
    const data = encoder.encode('\x1b\x40' + text + '\x0a\x0a\x0a'); // ESC @ (init) + text + line feeds

    // Send data in chunks of 512 bytes
    const chunkSize = 512;
    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.slice(i, i + chunkSize);
      await writeCharacteristic.writeValue(chunk);
    }

    device.gatt.disconnect();
    return { success: true, message: 'Print job sent successfully via Bluetooth!' };
  } catch (err: any) {
    console.error('Web Bluetooth Print Error:', err);
    if (err.name === 'NotFoundError' || err.message?.includes('cancelled')) {
      return { success: false, message: 'Bluetooth connection cancelled.' };
    }
    return {
      success: false,
      message: `Bluetooth error: ${err.message || 'Make sure Bluetooth printer is turned on and paired.'}`,
    };
  }
}
