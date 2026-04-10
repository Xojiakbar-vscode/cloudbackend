const { User, File, sequelize } = require('./src/models');
const { Op } = require('sequelize');

async function testStats() {
  try {
    console.log('Starting diagnostic...');
    const user = await User.findOne();
    if (!user) {
      console.log('No users found in database');
      process.exit(0);
    }
    const userId = user.id;
    console.log('Using userId:', userId);

    const fileWhere = { user_id: userId };

    console.log('Step 1: User.count');
    const uCount = await User.count();
    console.log('uCount:', uCount);

    console.log('Step 2: File.count');
    const fCount = await File.count({ where: fileWhere });
    console.log('fCount:', fCount);
    
    console.log('Step 3: File.findAll (storage)');
    try {
        const files = await File.findAll({
          where: fileWhere,
          attributes: ['file_size'],
        });
        console.log('files found for storage:', files.length);
    } catch (e) {
        console.error('FAILED Step 3:', e.message);
        if (e.parent) console.error('Parent error:', e.parent.message);
    }

    console.log('Step 4: File.findAll (history)');
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentFiles = await File.findAll({
          where: {
            ...fileWhere,
            created_at: { [Op.gte]: sevenDaysAgo }
          },
          attributes: ['created_at'],
          order: [['created_at', 'ASC']]
        });
        console.log('recentFiles found:', recentFiles.length);
    } catch (e) {
        console.error('FAILED Step 4:', e.message);
        if (e.parent) console.error('Parent error:', e.parent.message);
    }

    process.exit(0);
  } catch (error) {
    console.error('CRITICAL ERROR:', error);
    process.exit(1);
  }
}

testStats();
