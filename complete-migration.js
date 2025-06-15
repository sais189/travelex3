#!/usr/bin/env node

import pkg from 'pg';
const { Pool } = pkg;

const sourcePool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 3,
  connectionTimeoutMillis: 20000
});

const targetPool = new Pool({
  connectionString: 'postgresql://Travelex1_owner:npg_Gdv6fZW7mjzt@ep-long-glade-a20tplti-pooler.eu-central-1.aws.neon.tech/Travelex1?sslmode=require',
  max: 3,
  connectionTimeoutMillis: 20000
});

async function migrateTable(tableName) {
  console.log(`\nMigrating ${tableName}...`);
  
  try {
    // Get all data from source
    const sourceData = await sourcePool.query(`SELECT * FROM ${tableName}`);
    const rows = sourceData.rows;
    
    console.log(`Found ${rows.length} records in source ${tableName}`);
    
    if (rows.length === 0) {
      console.log(`No data to migrate for ${tableName}`);
      return { success: true, migrated: 0, total: 0 };
    }
    
    // Clear target table first
    await targetPool.query(`DELETE FROM ${tableName}`);
    
    // Insert data in smaller batches
    let migrated = 0;
    const batchSize = 25;
    
    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);
      
      for (const row of batch) {
        try {
          const columns = Object.keys(row);
          const values = Object.values(row);
          const placeholders = columns.map((_, idx) => `$${idx + 1}`).join(', ');
          const columnNames = columns.join(', ');
          
          const query = `INSERT INTO ${tableName} (${columnNames}) VALUES (${placeholders})`;
          await targetPool.query(query, values);
          migrated++;
        } catch (error) {
          console.error(`Error inserting record ${migrated + 1}:`, error.message);
        }
      }
      
      console.log(`Progress: ${Math.min(i + batchSize, rows.length)}/${rows.length} processed`);
    }
    
    console.log(`✓ ${tableName}: ${migrated}/${rows.length} records migrated`);
    return { success: true, migrated, total: rows.length };
    
  } catch (error) {
    console.error(`✗ ${tableName} migration failed:`, error.message);
    return { success: false, error: error.message };
  }
}

async function updateSequences() {
  console.log('\nUpdating sequences...');
  
  const sequences = [
    'destinations_id_seq',
    'bookings_id_seq', 
    'reviews_id_seq',
    'activity_logs_id_seq'
  ];
  
  for (const seq of sequences) {
    try {
      const tableName = seq.replace('_id_seq', '');
      const result = await targetPool.query(`SELECT setval('${seq}', (SELECT COALESCE(MAX(id), 1) FROM ${tableName}))`);
      console.log(`✓ Updated ${seq}`);
    } catch (error) {
      console.log(`Note: ${seq} - ${error.message}`);
    }
  }
}

async function verifyMigration() {
  console.log('\nVerification Results:');
  console.log('=====================================');
  
  const tables = ['users', 'destinations', 'bookings', 'reviews', 'activity_logs', 'sessions'];
  const results = [];
  
  for (const table of tables) {
    try {
      const [sourceResult, targetResult] = await Promise.all([
        sourcePool.query(`SELECT COUNT(*) FROM ${table}`),
        targetPool.query(`SELECT COUNT(*) FROM ${table}`)
      ]);
      
      const sourceCount = parseInt(sourceResult.rows[0].count);
      const targetCount = parseInt(targetResult.rows[0].count);
      const match = sourceCount === targetCount;
      
      console.log(`${table.padEnd(15)} | Source: ${sourceCount.toString().padStart(3)} | Target: ${targetCount.toString().padStart(3)} | ${match ? '✓' : '✗'}`);
      results.push({ table, sourceCount, targetCount, match });
      
    } catch (error) {
      console.log(`${table.padEnd(15)} | Error: ${error.message}`);
      results.push({ table, error: error.message });
    }
  }
  
  return results;
}

async function completeMigration() {
  console.log('Completing database migration...');
  console.log('Target: postgresql://Travelex1_owner:***@ep-long-glade-a20tplti-pooler.eu-central-1.aws.neon.tech/Travelex1\n');
  
  try {
    // Test connections
    await sourcePool.query('SELECT 1');
    await targetPool.query('SELECT 1');
    console.log('✓ Database connections established');
    
    // Migrate remaining tables in dependency order
    const tablesToMigrate = ['users', 'destinations', 'bookings', 'reviews', 'activity_logs'];
    const results = [];
    
    for (const table of tablesToMigrate) {
      const result = await migrateTable(table);
      results.push(result);
    }
    
    // Update sequences
    await updateSequences();
    
    // Final verification
    const verification = await verifyMigration();
    
    // Summary
    console.log('\n=====================================');
    console.log('MIGRATION SUMMARY');
    console.log('=====================================');
    
    const successful = verification.filter(v => v.match === true).length;
    const failed = verification.filter(v => v.match === false || v.error).length;
    
    console.log(`Tables migrated successfully: ${successful}`);
    console.log(`Tables with issues: ${failed}`);
    
    if (failed === 0) {
      console.log('\n🎉 Migration completed successfully!');
      console.log('All data has been transferred exactly to the new database.');
    } else {
      console.log('\n⚠️  Migration completed with some issues.');
      console.log('Please review the results above.');
    }
    
  } catch (error) {
    console.error('Migration failed:', error.message);
  } finally {
    await sourcePool.end();
    await targetPool.end();
  }
}

completeMigration();