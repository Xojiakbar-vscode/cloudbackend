const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const fileRoutes = require('./routes/file.routes');
const adminRoutes = require('./routes/admin.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const folderRoutes = require('./routes/folder.routes');
const supportRoutes = require('./routes/support.routes');
const setupSwagger = require('./swagger/swagger');
const errorMiddleware = require('./middlewares/error.middleware');

dotenv.config();

const app = express();

// Middlewares
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cors({ origin: '*' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/folders', folderRoutes);
app.use('/api/support', supportRoutes);

// Swagger
setupSwagger(app);

// Error handling
app.use(errorMiddleware);

module.exports = app;