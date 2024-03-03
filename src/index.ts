import fs from 'fs';
import process from 'process';
import DataProcessor from './data-processor/data-processor.class.js';
import { saveJson } from './data-processor/utils/save-json.js';
import { BankVariablesNames } from './data-processor/interfaces/bank-variables-names.interface.js';
import { Categories } from './data-processor/interfaces/categories.interface.js';

const categoriesFilePath = './data/results/categories.json';
let categoriesJson: Categories | undefined;
if (fs.existsSync(categoriesFilePath)) {
  categoriesJson = JSON.parse(
    fs.readFileSync(categoriesFilePath, 'utf-8')
  ) as Categories;
} else {
  console.log(`Categories file not found at ${categoriesFilePath}.`);
  categoriesJson = [];
}

const bankVariablesNames: BankVariablesNames = {
  credit: {
    amount: 'amount',
    title: 'title',
    date: 'date'
  },
  debit: {
    amount: 'Valor',
    title: 'Descrição',
    date: 'Data'
  }
};

const dataProcessor = new DataProcessor(categoriesJson, bankVariablesNames);

dataProcessor.processCSVFiles();

process.on('exit', () => {
  dataProcessor.fixNotFoundCategories();
  const categoriesFilePath = './data/results/categories.json';
  const categories = dataProcessor.getCategories();
  saveJson(categoriesFilePath, categories);

  const categoryTotals = dataProcessor.calculateTotalAmountByCategory();
  const totalAmountByCategoryFilePath =
    './data/results/totalAmountByCategory.json';
  saveJson(totalAmountByCategoryFilePath, categoryTotals);
});
