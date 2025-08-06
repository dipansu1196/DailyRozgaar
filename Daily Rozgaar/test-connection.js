require('dotenv').config();
const supabase = require('./config/database');
const cloudinary = require('./config/cloudinary');

async function testConnections() {
    console.log('Testing connections...\n');
    
    // Test Supabase connection
    try {
        const { data, error } = await supabase.from('workers').select('count').limit(1);
        if (error) throw error;
        console.log('✅ Supabase connection: SUCCESS');
    } catch (error) {
        console.log('❌ Supabase connection: FAILED');
        console.log('Error:', error.message);
    }
    
    // Test Cloudinary connection
    try {
        const result = await cloudinary.api.ping();
        console.log('✅ Cloudinary connection: SUCCESS');
    } catch (error) {
        console.log('❌ Cloudinary connection: FAILED');
        console.log('Error:', error.message);
    }
    
    console.log('\nConnection test completed.');
}

testConnections();