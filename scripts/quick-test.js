#!/usr/bin/env node

const BASE_URL = 'http://localhost:8888';

async function quickTest() {
  console.log('🚀 Quick Function Test');
  
  // Test hello function
  try {
    console.log('Testing hello function...');
    const response = await fetch(`${BASE_URL}/.netlify/functions/hello`);
    console.log(`Status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Hello function works!');
      console.log('Response:', data);
    } else {
      console.log('❌ Hello function failed');
      console.log('Response:', await response.text());
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

quickTest();