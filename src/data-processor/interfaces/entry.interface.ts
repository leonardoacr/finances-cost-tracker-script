import { Transaction } from './transaction.interface';

export interface Entry {
  date: string;
  result: Transaction[];
}
