# Bank Cost Tracker Script

The Bank Cost Tracker is a personal script designed to organize Bank expenses into categories. It allows users to export their credit and debit transactions as JSON files and to read in terminal, facilitating the conversion of data into a personal spreadsheet for tracking monthly costs.

## How to Use

1. **Edit the .bat file**: Update the path within the .bat file with the location of your project directory.

Example: 
   > C:\Users\johndoe\Desktop\bank-cost-tracker\dist

2. **Add CSV files**: Place the exported debit/credit CSV files from the Bank app or website into the `./data/csv` folder.

3. **Run the .bat**: Execute the .bat file, it should open a Windows Terminal window. If you are not using Windows OS, run `node index.js` on your terminal.

4. **Provide information**: Fill in the information that will be requested during the script execution.

5. **Enjoy the results**: Utilize the organized data for tracking your monthly expenses efficiently. You will see a new file named `results.json`, `resultsByCategory.json` and `categories.json` into `./data` folder, aswell the total costs in terminal.

## Repository Contents

- `src/data/csv/`: Directory for storing CSV files exported from Bank.
- `dist/data/results/`: Directory for storing results exported from the script.
- `src/`: Contains the main script for processing Bank transactions. You should change `bankVariablesNames`, in this script it was defined based on `Nubank` CSV configuration. 
- `README.md`: Instructions and information about the Bank Cost Tracker.
- `.bat`: Batch file for running the script.