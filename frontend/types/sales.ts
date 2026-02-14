export type PaymentMethod = 'cash' | 'card' | 'mobile' | 'check' | 'other';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type TransactionStatus = 'draft' | 'completed' | 'cancelled' | 'voided';

export interface POSItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface POSTransaction {
  id: number;
  transactionNumber: string;
  terminalId: string;
  terminalName: string;
  siteId: number;
  siteName: string;
  cashierId: number;
  cashierName: string;
  customerId?: number;
  customerName?: string;
  items: POSItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: TransactionStatus;
  transactionDate: string;
  receiptNumber?: string;
  receiptUrl?: string;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

export interface POSFilters {
  search?: string;
  status?: TransactionStatus;
  paymentStatus?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  siteId?: string;
}
