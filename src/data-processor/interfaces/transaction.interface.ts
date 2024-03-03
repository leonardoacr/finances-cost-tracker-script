export interface Transaction {
  title: string;
  category: string;
  amount: number;
  type: 'debit' | 'credit';
}
