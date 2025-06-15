#!/usr/bin/env node

import pkg from 'pg';
const { Pool } = pkg;
import fs from 'fs';

const sourcePool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const targetPool = new Pool({
  connectionString: 'postgresql://Travelex1_owner:npg_Gdv6fZW7mjzt@ep-long-glade-a20tplti-pooler.eu-central-1.aws.neon.tech/Travelex1?sslmode=require'
});

async function exportTableToCSV(tableName) {
  console.log(`Exporting ${tableName} to CSV...`);
  
  const result = await sourcePool.query(`SELECT * FROM ${tableName}`);
  const rows = result.rows;
  
  if (rows.length === 0) {
    console.log(`No data in ${tableName}`);
    return null;
  }
  
  const columns = Object.keys(rows[0]);
  const csvContent = rows.map(row => 
    columns.map(col => {
      const value = row[col];
      if (value === null) return '\\N';
      if (typeof value === 'object') return JSON.stringify(value).replace(/"/g, '""');
      return String(value).replace(/"/g, '""');
    }).join('\t')
  ).join('\n');
  
  fs.writeFileSync(`${tableName}.csv`, csvContent);
  console.log(`Exported ${rows.length} records from ${tableName}`);
  
  return { columns, count: rows.length };
}

async function importTableFromCSV(tableName, columns) {
  if (!fs.existsSync(`${tableName}.csv`)) {
    console.log(`No CSV file for ${tableName}`);
    return;
  }
  
  console.log(`Importing ${tableName} from CSV...`);
  
  try {
    // Clear existing data
    await targetPool.query(`TRUNCATE TABLE ${tableName} RESTART IDENTITY CASCADE`);
    
    // Read CSV content
    const csvContent = fs.readFileSync(`${tableName}.csv`, 'utf8');
    const rows = csvContent.trim().split('\n');
    
    if (rows.length === 0) return;
    
    // Bulk insert using unnest
    const batchSize = 100;
    let imported = 0;
    
    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);
      const values = [];
      const placeholders = [];
      
      batch.forEach((row, idx) => {
        const rowValues = row.split('\t').map(val => {
          if (val === '\\N') return null;
          if (val.startsWith('{') || val.startsWith('[')) {
            try { return JSON.parse(val); } catch { return val; }
          }
          return val;
        });
        
        rowValues.forEach((val, colIdx) => {
          values.push(val);
          if (idx === 0) placeholders.push(`$${colIdx + 1}`);
        });
      });
      
      if (batch.length === 1) {
        const query = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders.join(', ')})`;
        await targetPool.query(query, values);
      } else {
        // For multiple rows, use a different approach
        for (const row of batch) {
          const rowValues = row.split('\t').map(val => {
            if (val === '\\N') return null;
            if (val.startsWith('{') || val.startsWith('[')) {
              try { return JSON.parse(val); } catch { return val; }
            }
            return val;
          });
          
          const query = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${columns.map((_, idx) => `$${idx + 1}`).join(', ')})`;
          await targetPool.query(query, rowValues);
        }
      }
      
      imported += batch.length;
      console.log(`Imported ${imported}/${rows.length} records`);
    }
    
    console.log(`✓ ${tableName}: ${imported} records imported`);
    
  } catch (error) {
    console.error(`Error importing ${tableName}:`, error.message);
  }
}

async function runMigration() {
  console.log('Starting SQL-based migration...');
  
  try {
    // Test connections
    await sourcePool.query('SELECT 1');
    await targetPool.query('SELECT 1');
    console.log('Database connections established');
    
    // Tables to migrate in order
    const tables = ['sessions', 'users', 'destinations', 'bookings', 'reviews', 'activity_logs'];
    const exportedTables = {};
    
    // Export all tables to CSV
    for (const table of tables) {
      const result = await exportTableToCSV(table);
      if (result) {
        exportedTables[table] = result;
      }
    }
    
    // Import all tables from CSV
    for (const table of tables) {
      if (exportedTables[table]) {
        await importTableFromCSV(table, exportedTables[table].columns);
      }
    }
    
    // Update sequences
    const sequences = ['destinations_id_seq', 'bookings_id_seq', 'reviews_id_seq', 'activity_logs_id_seq'];
    for (const seq of sequences) {
      try {
        const table = seq.replace('_id_seq', '');
        await targetPool.query(`SELECT setval('${seq}', (SELECT COALESCE(MAX(id), 1) FROM ${table}))`);
      } catch (error) {
        console.log(`Sequence ${seq}: ${error.message}`);
      }
    }
    
    // Verify migration
    console.log('\nVerification:');
    for (const table of tables) {
      try {
        const [sourceCount, targetCount] = await Promise.all([
          sourcePool.query(`SELECT COUNT(*) FROM ${table}`),
          targetPool.query(`SELECT COUNT(*) FROM ${table}`)
        ]);
        
        const src = parseInt(sourceCount.rows[0].count);
        const tgt = parseInt(targetCount.rows[0].count);
        console.log(`${table}: ${src} -> ${tgt} ${src === tgt ? '✓' : '✗'}`);
      } catch (error) {
        console.log(`${table}: Error - ${error.message}`);
      }
    }
    
    console.log('\nMigration completed');
    
  } catch (error) {
    console.error('Migration failed:', error.message);
  } finally {
    // Cleanup CSV files
    const tables = ['sessions', 'users', 'destinations', 'bookings', 'reviews', 'activity_logs'];
    tables.forEach(table => {
      try { fs.unlinkSync(`${table}.csv`); } catch {}
    });
    
    await sourcePool.end();
    await targetPool.end();
  }
}

runMigration();