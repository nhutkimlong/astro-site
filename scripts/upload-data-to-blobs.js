#!/usr/bin/env node

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Data files to upload
const dataFiles = [
  'POI.json',
  'Tours.json', 
  'Accommodations.json',
  'Restaurants.json',
  'Specialties.json',
  'GioHoatDong.json'
];

async function uploadDataToBlobs() {
  console.log('🚀 Starting data upload to Netlify Blobs...');
  const BASE_URL = process.env.NETLIFY_DEV_URL || 'http://localhost:8888';
  
  for (const filename of dataFiles) {
    const filePath = join(__dirname, '..', 'src', 'data', filename);
    
    if (!existsSync(filePath)) {
      console.log(`⚠️  File not found: ${filename}`);
      continue;
    }
    
    try {
      const data = JSON.parse(readFileSync(filePath, 'utf8'));
      
      const response = await fetch(`${BASE_URL}/.netlify/functions/data-blobs?file=${encodeURIComponent(filename)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      if (response.ok) {
        console.log(`✅ Uploaded: ${filename}`);
      } else {
        console.log(`❌ Failed to upload: ${filename} - ${response.statusText}`);
      }
    } catch (error) {
      console.log(`❌ Error uploading ${filename}:`, error.message);
    }
  }
  
  console.log('🎉 Data upload completed!');
}

// Only run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  uploadDataToBlobs().catch(console.error);
}

export { uploadDataToBlobs };
