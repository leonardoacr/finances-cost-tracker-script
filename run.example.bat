@echo off

cd [REPLACE_WITH_PROJECT_PATH]
tsc  && tscp  && wt -d dist -p "Bash" cmd /k "node index.js"
