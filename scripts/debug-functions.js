#!/usr/bin/env node

// Debug script để kiểm tra Netlify Functions
const BASE_URL = 'http://localhost:8889';

async function debugFunctions() {
  console.log('🔍 Debugging Netlify Functions...');
  console.log(`📍 Testing URL: ${BASE_URL}`);
  
  // Test basic connectivity
  console.log('\n1️⃣ Testing basic connectivity...');
  try {
    const response = await fetch(`${BASE_URL}`);
    console.log(`✅ Frontend accessible: ${response.status}`);
  } catch (error) {
    console.log(`❌ Frontend not accessible: ${error.message}`);
    console.log('💡 Make sure to run: npm run netlify:dev');
    return;
  }
  
  // Test functions endpoint
  console.log('\n2️⃣ Testing functions endpoint...');
  const functions = ['data-blobs', 'combined-data', 'auth'];
  
  for (const func of functions) {
    try {
      const url = `${BASE_URL}/.netlify/functions/${func}`;
      console.log(`   Testing: ${url}`);
      
      let response;
      if (func === 'auth') {
        response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: 'test' })
        });
      } else if (func === 'data-blobs') {
        response = await fetch(`${url}?file=POI.json`);
      } else {
        response = await fetch(url);
      }
      
      console.log(`   ✅ ${func}: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          console.log(`   📄 Response type: ${typeof data}`);
        }
      }
    } catch (error) {
      console.log(`   ❌ ${func}: ${error.message}`);
    }
  }
  
  // Test API redirect
  console.log('\n3️⃣ Testing API redirect...');
  try {
    const response = await fetch(`${BASE_URL}/api/combined-data`);
    console.log(`✅ API redirect: ${response.status}`);
  } catch (error) {
    console.log(`❌ API redirect: ${error.message}`);
  }
  
  console.log('\n🎯 Debug completed!');
  console.log('\n💡 Tips:');
  console.log('   - Make sure Netlify CLI is installed: npm install -g netlify-cli');
  console.log('   - Start dev server: npm run netlify:dev');
  console.log('   - Check functions in browser: http://localhost:8888/.netlify/functions/');
}

debugFunctions().catch(console.error);