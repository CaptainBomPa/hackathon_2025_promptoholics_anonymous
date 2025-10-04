#!/usr/bin/env node

/**
 * Quick API Test Script
 * Tests the pension calculation API endpoints
 */

const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8080';

const testData = {
  age: 35,
  sex: 'F',
  grossSalaryPLN: 8500,
  startYear: 2015,
  plannedEndYear: 2055,
  expectedPensionPLN: 4500,
  includeSickLeave: false,
  zusAccountFundsPLN: 25000,
  contractType: 'EMPLOYMENT_CONTRACT'
};

async function testAPI() {
  console.log('🧪 Testing Pension Simulator API...');
  console.log(`📡 Base URL: ${API_BASE_URL}`);
  
  try {
    // Test 1: Health check (if available)
    console.log('\n1️⃣ Testing health endpoint...');
    try {
      const healthResponse = await axios.get(`${API_BASE_URL}/actuator/health`, { timeout: 5000 });
      console.log('✅ Health check:', healthResponse.data.status);
    } catch (error) {
      console.log('⚠️ Health endpoint not available or failed');
    }
    
    // Test 2: Random fact
    console.log('\n2️⃣ Testing random fact endpoint...');
    try {
      const factResponse = await axios.get(`${API_BASE_URL}/facts/random?locale=pl-PL`, { timeout: 10000 });
      console.log('✅ Random fact:', factResponse.data.text.substring(0, 100) + '...');
    } catch (error) {
      console.log('❌ Random fact failed:', error.response?.status, error.message);
    }
    
    // Test 3: Pension calculation
    console.log('\n3️⃣ Testing pension calculation...');
    try {
      const startTime = Date.now();
      const calcResponse = await axios.post(`${API_BASE_URL}/pensions/calculate`, testData, { 
        timeout: 30000,
        headers: { 'Content-Type': 'application/json' }
      });
      const duration = Date.now() - startTime;
      
      console.log('✅ Pension calculation successful!');
      console.log(`⏱️ Duration: ${duration}ms`);
      console.log('📊 Results:');
      console.log(`   - Actual Amount: ${calcResponse.data.result.actualAmountPLN} PLN`);
      console.log(`   - Real Amount: ${calcResponse.data.result.realAmountDeflated} PLN`);
      console.log(`   - Replacement Rate: ${calcResponse.data.result.replacementRatePct}%`);
      console.log(`   - ID: ${calcResponse.data.id}`);
      
      return calcResponse.data.id;
    } catch (error) {
      console.log('❌ Pension calculation failed:', error.response?.status, error.message);
      if (error.response?.data) {
        console.log('📋 Error details:', JSON.stringify(error.response.data, null, 2));
      }
      return null;
    }
    
  } catch (error) {
    console.error('💥 General error:', error.message);
  }
}

// Run tests
testAPI().then((calculationId) => {
  if (calculationId) {
    console.log('\n🎉 API tests completed successfully!');
    console.log(`💾 Calculation ID: ${calculationId}`);
  } else {
    console.log('\n⚠️ Some API tests failed, but this might be expected if backend is not running');
  }
  
  console.log('\n📝 Next steps:');
  console.log('1. Start backend: cd ApiBackend && ./gradlew bootRun');
  console.log('2. Start frontend: cd front && npm start');
  console.log('3. Or deploy with Docker: ./deploy.sh');
}).catch(console.error);