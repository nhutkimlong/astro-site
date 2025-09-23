#!/usr/bin/env node

/**
 * Script to upload local JSON data files to Netlify Blobs
 * Usage: node scripts/upload-to-netlify-blobs.js
 */

import { getStore } from '@netlify/blobs';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '..', 'src', 'data');

// Initialize Netlify Blobs store
const dataStore = getStore('data-files');

// List of files to upload
const filesToUpload = [
  'POI.json',
  'Tours.json', 
  'Accommodations.json',
  'Restaurants.json',
  'Specialties.json',
  'GioHoatDong.json'
];

async function uploadFile(fileName) {
  try {
    const filePath = join(dataDir, fileName);
    console.log(`Reading ${fileName} from ${filePath}...`);
    
    const fileContent = readFileSync(filePath, 'utf8');
    const jsonData = JSON.parse(fileContent);
    
    console.log(`Uploading ${fileName} to Netlify Blobs...`);
    await dataStore.setJSON(fileName, jsonData);
    
    console.log(`✅ Successfully uploaded ${fileName}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to upload ${fileName}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting upload to Netlify Blobs...\n');
  
  let successCount = 0;
  let failCount = 0;
  
  for (const fileName of filesToUpload) {
    const success = await uploadFile(fileName);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
    console.log(''); // Empty line for readability
  }
  
  console.log('📊 Upload Summary:');
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`📁 Total files: ${filesToUpload.length}`);
  
  if (failCount === 0) {
    console.log('\n🎉 All files uploaded successfully!');
  } else {
    console.log('\n⚠️  Some files failed to upload. Check the errors above.');
    process.exit(1);
  }
}

// Run the script
main().catch(error => {
  console.error('💥 Script failed:', error);
  process.exit(1);
});
