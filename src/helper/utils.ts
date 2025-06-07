import { saleModel } from "../database";


// Convert number to words
export const numberToWords = (num: number): string => {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

  if (num === 0) return 'Zero';

  const convertLessThanThousand = (n: number): string => {
    if (n === 0) return '';
    if (n < 10) return ones[n];
    if (n < 20) return teens[n - 10];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
    return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' and ' + convertLessThanThousand(n % 100) : '');
  };

  const convert = (n: number): string => {
    if (n === 0) return '';
    if (n < 1000) return convertLessThanThousand(n);
    if (n < 100000) return convertLessThanThousand(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 !== 0 ? ' ' + convertLessThanThousand(n % 1000) : '');
    if (n < 10000000) return convertLessThanThousand(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 !== 0 ? ' ' + convert(n % 100000) : '');
    return convertLessThanThousand(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 !== 0 ? ' ' + convert(n % 10000000) : '');
  };

  return convert(num) + ' Rupees Only';
};

// Calculate profit
export const calculateProfit = (total: number, cost: number): number => {
  return total - cost;
};

// Calculate cost per gram
export const calculateCostPerGram = (perKgCost: number): number => {
  return perKgCost / 1000;
};

// Generate invoice number
export const generateInvoiceNumber = async (): Promise<string> => {
  const date = new Date();
  const year = date.getFullYear().toString(); // 4 digits
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');

  // Get the last invoice number for today
  const startOfDay = new Date(date.setHours(0, 0, 0, 0));
  const endOfDay = new Date(date.setHours(23, 59, 59, 999));
  const lastSale = await saleModel.findOne({
    date: {
      $gte: startOfDay,
      $lt: endOfDay
    }
  }).sort({ invoiceNumber: -1 });

  let sequence = '000001';
  if (lastSale) {
    const lastSequence = parseInt(lastSale.invoiceNumber.slice(-6));
    sequence = (lastSequence + 1).toString().padStart(6, '0');
  }

  return `${year}${month}${day}${sequence}`; // 14 characters
};

// Group sales by date/month/year
export const groupSales = (sales: any[], groupBy: 'date' | 'month' | 'year') => {
  const grouped: { [key: string]: any[] } = {};

  sales.forEach(sale => {
    const date = new Date(sale.date);
    let key: string;

    if (groupBy === 'date') {
      key = date.toISOString().split('T')[0];
    } else if (groupBy === 'month') {
      key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    } else {
      key = date.getFullYear().toString();
    }

    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(sale);
  });

  return grouped;
}; 