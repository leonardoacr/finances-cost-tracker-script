import { Transaction } from './transaction.interface';

export interface TotalAmountByCategoryItem {
  year: number;
  yearResults: {
    totalAmountDeposit: number;
    totalAmountSpent: number;
    month: number;
    monthResults: {
      category: string;
      amount: number;
      items: Omit<Transaction, 'category'>[];
    }[];
  }[];
}

export type TotalAmountByCategory = TotalAmountByCategoryItem[];
