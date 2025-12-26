import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'db.json');

export function readData() {
  if (!fs.existsSync(dbPath)) {
    return { users: [], tasks: [] };
  }
  const fileData = fs.readFileSync(dbPath, 'utf8');
  return JSON.parse(fileData);
}

export function writeData(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}
