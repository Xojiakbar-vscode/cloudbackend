const express = require('express');
const router = express.Router();
const fileController = require('../controllers/file.controller');
const authenticate = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

// Public sharing (no auth)
router.get('/share/:id', fileController.shareFile);

router.use(authenticate);

// Trash management
router.get('/trash', fileController.getTrashFiles);
router.post('/:id/restore', fileController.restoreFile);
router.delete('/:id/permanent', fileController.permanentlyDeleteFile);

// Secret vault
router.post('/:id/move-to-secret', fileController.moveToSecret);

// Basic file operations
router.post('/upload', upload.single('file'), fileController.uploadFile);
router.get('/view/:id', fileController.viewFile);
router.get('/', fileController.getUserFiles);
router.get('/:id', fileController.getFileById);
router.delete('/:id', fileController.deleteFile);

module.exports = router;