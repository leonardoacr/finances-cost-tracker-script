import fs from 'fs';
import path from 'path';

export const saveJson = (filePath: string, target: object): void => {
  const directory = path.dirname(filePath);
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
  fs.writeFileSync(filePath, JSON.stringify(target, null, 2));
};
