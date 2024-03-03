import path from 'path';
import csv from 'csv-parser';
import readlineSync from 'readline-sync';
import { toFixedValue } from './utils/to-fixed-value';
import fs from 'fs';
import { Transaction } from './interfaces/transaction.interface';
import { BankVariablesNames } from './interfaces/bank-variables-names.interface';
import { Categories } from './interfaces/categories.interface';
import { Entry } from './interfaces/entry.interface';
import { CSVConfig } from './interfaces/csv-config.interface';
import {
  TotalAmountByCategory,
  TotalAmountByCategoryItem
} from './interfaces/total-amount-by-category.interface';
import { CsvRow } from './interfaces/csv-row.interface';

export default class DataProcessor {
  private csvConfig: CSVConfig = {
    directory: './data/csv',
    fileExtensions: ['.csv']
  };
  private entries: Entry[];

  constructor(
    private categories: Categories,
    private bankVariablesNames: BankVariablesNames
  ) {
    this.entries = [];
  }

  processCSVFiles(): void {
    const { directory, fileExtensions } = this.csvConfig;
    fs.readdirSync(directory).forEach((file) => {
      if (fileExtensions.includes(path.extname(file))) {
        const filePath = path.join(directory, file);
        this.processCSVFile(filePath, file);
      }
    });
  }

  private processCSVFile(filePath: fs.PathLike, fileName: string): void {
    const transactionType = this.determineTransactionType(fileName);

    if (!transactionType) return;

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row: CsvRow) =>
        this.handleCSVRow(row, transactionType as Transaction['type'])
      )
      .on('end', () => console.log(`File ${fileName} processed successfully.`));
  }

  private determineTransactionType(fileName: string): string | null {
    if (fileName.startsWith('credit_')) {
      return 'credit';
    } else if (fileName.startsWith('debit_')) {
      return 'debit';
    } else {
      console.log(`Invalid file name: ${fileName}`);
      return null;
    }
  }

  private handleCSVRow(
    row: CsvRow,
    transactionType: Transaction['type']
  ): void {
    let amount = 0,
      title = '',
      category = '',
      date = '';
    if (transactionType === 'credit') {
      amount = toFixedValue(
        parseFloat(row[this.bankVariablesNames.credit.amount]) * -1,
        2
      );
      title = row[this.bankVariablesNames.credit.title].trim();
      const rawDate = row[this.bankVariablesNames.credit.date].trim();
      const [year, month] = rawDate.split('-');
      date = `${year}-${month}`;
    } else if (transactionType === 'debit') {
      amount = toFixedValue(
        parseFloat(row[this.bankVariablesNames.debit.amount]),
        2
      );
      title = row[this.bankVariablesNames.debit.title].trim();
      const rawDate = row[this.bankVariablesNames.debit.date].trim();
      const [, month, year] = rawDate.split('/');
      date = `${year}-${month}`;
    }

    const isAmountDeposit = amount > 0;

    category = this.getCategory(title, isAmountDeposit);

    const findDateIndex = this.entries.findIndex(
      (entry) => entry.date === date
    );

    if (findDateIndex !== -1) {
      const existingEntry = this.entries[findDateIndex];
      existingEntry.result.push({
        title,
        category,
        amount,
        type: transactionType
      });
      this.entries[findDateIndex] = existingEntry;
    } else {
      this.entries.push({
        date,
        result: [{ title, category, amount, type: transactionType }]
      });
    }
  }

  private getCategory(title: string, isAmountDeposit: boolean): string {
    if (!this.categories) this.categories = [];

    const existingCategoryWithTitle = this.categories.find((category) =>
      category.titles.includes(title)
    );

    let category: string;

    if (existingCategoryWithTitle) {
      category = existingCategoryWithTitle.name;
    } else {
      if (isAmountDeposit) {
        category = 'Deposit';
      } else {
        category = 'Not Found';
      }
      this.updateCategories(category, title);
    }

    return category;
  }

  private updateCategories(category: string, title: string): void {
    let existingCategory = this.categories.find(
      (categoryItem) => categoryItem.name === category
    );

    if (!existingCategory) {
      existingCategory = { name: category, titles: [] };
      this.categories.push(existingCategory);
    }

    if (!existingCategory.titles.includes(title)) {
      existingCategory.titles.push(title);
    }
  }

  fixNotFoundCategories() {
    const notFoundCategoriesIndex = this.categories.findIndex(
      (category) => category.name === 'Not Found'
    );

    if (notFoundCategoriesIndex === -1) return;

    const notFoundCategories = this.categories[notFoundCategoriesIndex];

    const foundTitles: string[] = [];
    notFoundCategories.titles.forEach((notFoundCategory) => {
      console.log(`Category not found for title: ${notFoundCategory}`);
      console.log(`Please enter the category for "${notFoundCategory}":`);
      const category = readlineSync.question('> ');

      this.updateCategories(category, notFoundCategory);

      foundTitles.push(notFoundCategory);
    });

    this.categories[notFoundCategoriesIndex].titles =
      notFoundCategories.titles.filter((title) => !foundTitles.includes(title));

    if (this.categories[notFoundCategoriesIndex].titles.length === 0) {
      this.categories.splice(notFoundCategoriesIndex, 1);
    }
  }

  getCategories(): Categories {
    return this.categories;
  }

  calculateTotalAmountByCategory(): TotalAmountByCategory {
    const totalAmountByCategory: TotalAmountByCategory = [];

    for (const entry of this.entries) {
      let totalAmountDeposit = 0;
      let totalAmountSpent = 0;

      const totalAmountByCategoryItem: TotalAmountByCategoryItem = {
        date: entry.date,
        results: [],
        totalAmountDeposit: 0,
        totalAmountSpent: 0
      };

      for (const entryResult of entry.result) {
        const categoryIndex = totalAmountByCategoryItem.results.findIndex(
          (result) => result.category === entryResult.category
        );

        if (categoryIndex !== -1) {
          const totalAmountByCategoryItemResult =
            totalAmountByCategoryItem.results[categoryIndex];
          totalAmountByCategoryItemResult.amount = toFixedValue(
            entryResult.amount + totalAmountByCategoryItemResult.amount,
            2
          );
          totalAmountByCategoryItemResult.items.push({
            title: entryResult.title,
            amount: entryResult.amount,
            type: entryResult.type
          });
        } else {
          totalAmountByCategoryItem.results.push({
            category: entryResult.category,
            amount: toFixedValue(entryResult.amount, 2),
            items: [
              {
                title: entryResult.title,
                amount: entryResult.amount,
                type: entryResult.type
              }
            ]
          });
        }

        if (entryResult.amount < 0) {
          totalAmountSpent += entryResult.amount;
        } else {
          totalAmountDeposit += entryResult.amount;
        }
      }

      totalAmountByCategoryItem.totalAmountDeposit +=
        totalAmountDeposit > 0 ? toFixedValue(totalAmountDeposit, 2) : 0;
      totalAmountByCategoryItem.totalAmountSpent +=
        totalAmountSpent < 0 ? toFixedValue(totalAmountSpent, 2) : 0;

      totalAmountByCategory.push(totalAmountByCategoryItem);
    }

    return totalAmountByCategory;
  }
}
