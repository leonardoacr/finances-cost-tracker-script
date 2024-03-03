import { Transaction } from './transaction.interface';

export interface TotalAmountByCategoryItem {
  date: string;
  results: {
    category: string;
    amount: number;
    items: Omit<Transaction, 'category'>[];
  }[];
  totalAmountSpent: number;
  totalAmountDeposit: number;
}

export type TotalAmountByCategory = TotalAmountByCategoryItem[];
