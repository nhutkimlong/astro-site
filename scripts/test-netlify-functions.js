#!/usr/bin/env node

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const BASE_URL = process.env.NETLIFY_DEV_URL || 'http://localhost:8888';

async function testNetlifyFunctions() {
  console.log('🧪 Testing Netlify Functions...');
  console.log(`📍 Base URL: ${BASE_URL}`);
  
  // Test data-blobs function
  console.log('\n📊 Testing data-blobs function...');
  
  const testFiles = ['POI.json', 'Tours.json'];
  
  for (const file of testFiles) {
    try {
      const response = await fetch(`${BASE_URL}/.netlify/functions/data-blobs?file=${encodeURIComponent(file)}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${file}: OK (${Array.isArray(data) ? data.length : 'object'} items)`);
      } else {
        console.log(`❌ ${file}: Failed (${response.status})`);
      }
    } catch (error) {
      console.log(`❌ ${file}: Error - ${error.message}`);
    }
  }
  
  // Test combined-data function
  console.log('\n🔧 Testing combined-data function...');
  
  try {
    const response = await fetch(`${BASE_URL}/.netlify/functions/combined-data`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ combined-data: OK`);
      console.log(`   - Notifications: ${data.notifications?.data?.length || 0} items`);
      console.log(`   - GPS Settings: ${data.gpsSettings?.data ? 'OK' : 'Missing'}`);
    } else {
      console.log(`❌ combined-data: Failed (${response.status})`);
    }
  } catch (error) {
    console.log(`❌ combined-data: Error - ${error.message}`);
  }
  
  // Test auth function
  console.log('\n🔐 Testing auth function...');
  
  try {
    const response = await fetch(`${BASE_URL}/.netlify/functions/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password: 'nuibaden2025' })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ auth: OK (${data.success ? 'Authenticated' : 'Failed'})`);
    } else {
      console.log(`❌ auth: Failed (${response.status})`);
    }
  } catch (error) {
    console.log(`❌ auth: Error - ${error.message}`);
  }
  
  console.log('\n🎉 Testing completed!');
}

// Only run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testNetlifyFunctions().catch(console.error);
}

export { testNetlifyFunctions };
