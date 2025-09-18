const { MongoClient } = require('mongodb');
require('dotenv').config();

async function testConnection() {
    console.log('Testing MongoDB connection...');
    console.log('URI:', process.env.MONGO_URI);
    
    try {
        const client = new MongoClient(process.env.MONGO_URI);
        await client.connect();
        console.log('✅ MongoDB connection successful!');
        await client.close();
    } catch (error) {
        console.log('❌ MongoDB connection failed:', error.message);
        
        // Try alternative connection without SRV
        console.log('\nTrying alternative connection...');
        const altUri = 'mongodb+srv://cabalquintomary2002_db_user:GEuea5qkRus4vH0X@cluster0.mongodb.net/test?retryWrites=true&w=majority';
        try {
            const client2 = new MongoClient(altUri);
            await client2.connect();
            console.log('✅ Alternative connection successful!');
            await client2.close();
        } catch (error2) {
            console.log('❌ Alternative connection also failed:', error2.message);
        }
    }
}

testConnection();
