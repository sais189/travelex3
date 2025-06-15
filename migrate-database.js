#!/usr/bin/env node

import pkg from 'pg';
const { Pool } = pkg;
import fs from 'fs';
import { execSync } from 'child_process';

// Source database (current)
const sourcePool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Target database (new destination)
const targetPool = new Pool({
  connectionString: 'postgresql://Travelex1_owner:npg_Gdv6fZW7mjzt@ep-long-glade-a20tplti-pooler.eu-central-1.aws.neon.tech/Travelex1?sslmode=require'
});

// Table order for migration (respecting foreign key dependencies)
const TABLES = ['users', 'destinations', 'bookings', 'reviews', 'activity_logs', 'sessions'];

async function exportTableSchema(tableName) {
  console.log(`Exporting schema for table: ${tableName}`);
  
  const schemaQuery = `
    SELECT 
      column_name,
      data_type,
      is_nullable,
      column_default,
      character_maximum_length,
      numeric_precision,
      numeric_scale
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = $1
    ORDER BY ordinal_position;
  `;
  
  const result = await sourcePool.query(schemaQuery, [tableName]);
  return result.rows;
}

async function exportTableData(tableName) {
  console.log(`Exporting data from table: ${tableName}`);
  
  const dataQuery = `SELECT * FROM ${tableName} ORDER BY 1`;
  const result = await sourcePool.query(dataQuery);
  
  console.log(`Found ${result.rows.length} records in ${tableName}`);
  return result.rows;
}

async function getTableConstraints() {
  console.log('Exporting table constraints and indexes...');
  
  const constraintsQuery = `
    SELECT 
      tc.table_name,
      tc.constraint_name,
      tc.constraint_type,
      kcu.column_name,
      ccu.table_name AS foreign_table_name,
      ccu.column_name AS foreign_column_name
    FROM information_schema.table_constraints tc
    LEFT JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
    LEFT JOIN information_schema.constraint_column_usage ccu
      ON ccu.constraint_name = tc.constraint_name
    WHERE tc.table_schema = 'public'
    ORDER BY tc.table_name, tc.constraint_name;
  `;
  
  const result = await sourcePool.query(constraintsQuery);
  return result.rows;
}

async function getTableIndexes() {
  const indexQuery = `
    SELECT 
      schemaname,
      tablename,
      indexname,
      indexdef
    FROM pg_indexes
    WHERE schemaname = 'public'
    ORDER BY tablename, indexname;
  `;
  
  const result = await sourcePool.query(indexQuery);
  return result.rows;
}

async function createSchema() {
  console.log('Creating schema on target database...');
  
  // First, let's check if drizzle push can be used
  
  try {
    // Update the DATABASE_URL temporarily for schema push
    const originalUrl = process.env.DATABASE_URL;
    process.env.DATABASE_URL = 'postgresql://Travelex1_owner:npg_Gdv6fZW7mjzt@ep-long-glade-a20tplti-pooler.eu-central-1.aws.neon.tech/Travelex1?sslmode=require';
    
    console.log('Running drizzle push to create schema...');
    execSync('npm run db:push', { stdio: 'inherit' });
    
    // Restore original URL
    process.env.DATABASE_URL = originalUrl;
    
    console.log('Schema created successfully');
  } catch (error) {
    console.error('Error creating schema with drizzle:', error.message);
    throw error;
  }
}

async function insertData(tableName, data) {
  if (data.length === 0) {
    console.log(`No data to insert for table: ${tableName}`);
    return;
  }
  
  console.log(`Inserting ${data.length} records into ${tableName}...`);
  
  // Get column names from first row
  const columns = Object.keys(data[0]);
  const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
  const columnNames = columns.join(', ');
  
  const insertQuery = `
    INSERT INTO ${tableName} (${columnNames}) 
    VALUES (${placeholders})
    ON CONFLICT DO NOTHING
  `;
  
  let inserted = 0;
  for (const row of data) {
    try {
      const values = columns.map(col => row[col]);
      await targetPool.query(insertQuery, values);
      inserted++;
    } catch (error) {
      console.error(`Error inserting row in ${tableName}:`, error.message);
      console.error('Row data:', row);
    }
  }
  
  console.log(`Successfully inserted ${inserted}/${data.length} records into ${tableName}`);
}

async function updateSequences() {
  console.log('Updating sequences...');
  
  const sequenceQueries = [
    "SELECT setval('users_id_seq', (SELECT COALESCE(MAX(CAST(id AS INTEGER)), 1) FROM users WHERE id ~ '^[0-9]+$'), false);",
    "SELECT setval('destinations_id_seq', (SELECT COALESCE(MAX(id), 1) FROM destinations), false);",
    "SELECT setval('bookings_id_seq', (SELECT COALESCE(MAX(id), 1) FROM bookings), false);",
    "SELECT setval('reviews_id_seq', (SELECT COALESCE(MAX(id), 1) FROM reviews), false);",
    "SELECT setval('activity_logs_id_seq', (SELECT COALESCE(MAX(id), 1) FROM activity_logs), false);"
  ];
  
  for (const query of sequenceQueries) {
    try {
      await targetPool.query(query);
    } catch (error) {
      console.log(`Note: ${error.message} (this may be normal if sequence doesn't exist)`);
    }
  }
}

async function verifyMigration() {
  console.log('\nVerifying migration...');
  
  for (const table of TABLES) {
    const sourceCount = await sourcePool.query(`SELECT COUNT(*) FROM ${table}`);
    const targetCount = await targetPool.query(`SELECT COUNT(*) FROM ${table}`);
    
    const sourceRows = parseInt(sourceCount.rows[0].count);
    const targetRows = parseInt(targetCount.rows[0].count);
    
    console.log(`${table}: Source=${sourceRows}, Target=${targetRows} ${sourceRows === targetRows ? '✓' : '✗'}`);
  }
}

async function migrate() {
  try {
    console.log('Starting database migration...');
    console.log('Source:', process.env.DATABASE_URL?.substring(0, 50) + '...');
    console.log('Target: postgresql://Travelex1_owner:***@ep-long-glade-a20tplti-pooler.eu-central-1.aws.neon.tech/Travelex1');
    
    // Test connections
    await sourcePool.query('SELECT 1');
    await targetPool.query('SELECT 1');
    console.log('Database connections established ✓');
    
    // Create schema
    await createSchema();
    
    // Export and import data for each table
    for (const table of TABLES) {
      const data = await exportTableData(table);
      await insertData(table, data);
    }
    
    // Update sequences
    await updateSequences();
    
    // Verify migration
    await verifyMigration();
    
    console.log('\nMigration completed successfully! 🎉');
    
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await sourcePool.end();
    await targetPool.end();
  }
}

// Run migration
migrate().catch(console.error);