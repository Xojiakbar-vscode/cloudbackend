const { sequelize } = require('./src/models');

async function checkTable() {
  try {
    const [results, metadata] = await sequelize.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'files'");
    console.log('Files table columns:');
    console.table(results);
    
    const [users] = await sequelize.query("SELECT id, role FROM users LIMIT 1");
    console.log('Sample user:', users[0]);
    
    process.exit(0);
  } catch (error) {
    console.error('Error checking table:', error);
    process.exit(1);
  }
}

checkTable();
