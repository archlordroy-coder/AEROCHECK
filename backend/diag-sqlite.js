import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

try {
  console.log('Starting SQLite diagnostic...');
  const dbPath = path.resolve(process.cwd(), 'diag-test.db');
  console.log(`Using DB path: ${dbPath}`);
  
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
  }

  const db = new Database(dbPath);
  console.log('Database instance created.');
  
  db.exec('CREATE TABLE test (id INTEGER PRIMARY KEY, val TEXT)');
  console.log('Table created.');
  
  const insert = db.prepare('INSERT INTO test (val) VALUES (?)');
  insert.run('hello');
  console.log('Row inserted.');
  
  const row = db.prepare('SELECT * FROM test').get();
  console.log('Selected row:', row);
  
  db.close();
  console.log('Database closed. Diagnostic successful.');
  process.exit(0);
} catch (error) {
  console.error('Diagnostic failed with error:', error);
  process.exit(1);
}
