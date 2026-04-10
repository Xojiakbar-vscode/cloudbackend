const axios = require('axios');

async function testEndpoint() {
  try {
    // We need a token. Let's try to login or just use a known userId if we can bypass auth for testing?
    // Better: let's use the local IP from index.ts
    const baseUrl = 'http://localhost:5000/api';
    
    // But we need a token. I'll search for a user in the DB and generate a token for them.
    const { User } = require('./src/models');
    const { generateToken } = require('./src/utils/jwt');
    
    const user = await User.findOne();
    if (!user) {
        console.log('No user found to test with');
        process.exit(0);
    }
    
    const token = generateToken({ id: user.id, role: user.role });
    console.log('Generated token for user:', user.email);
    
    const response = await axios.get(`${baseUrl}/dashboard/stats`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
    process.exit(0);
  } catch (error) {
    if (error.response) {
        console.error('Error status:', error.response.status);
        console.error('Error data:', JSON.stringify(error.response.data, null, 2));
    } else {
        console.error('Error:', error.message);
    }
    process.exit(1);
  }
}

testEndpoint();
