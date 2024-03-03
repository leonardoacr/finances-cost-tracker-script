import fs from 'fs';

export const saveJson = (path: string, target: Object): void => {
  fs.writeFileSync(path, JSON.stringify(target, null, 2));
};
