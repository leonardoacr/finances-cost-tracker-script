import fs from 'fs';
import path from 'path';
import process from 'process';
import DataProcessor, {
  BankVariablesNames,
  CSVConfig,
  Categories
} from './data-processor/data-processor.class.js';
import { saveJson } from './data-processor/utils/save-json.js';

// Check if the categories file exists
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
  const categoriesFilePath = './data/results/categories.json';
  const categories = dataProcessor.getCategories();
  saveJson(categoriesFilePath, categories);

  const categoryTotals = dataProcessor.calculateTotalAmountByCategory();
  const totalAmountByCategoryFilePath =
    './data/results/totalAmountByCategory.json';
  saveJson(totalAmountByCategoryFilePath, categoryTotals);
});
