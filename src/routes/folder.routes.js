const express = require('express');
const router = express.Router();
const folderController = require('../controllers/folder.controller');
const authenticate = require('../middlewares/auth.middleware');

router.use(authenticate);

// Trash management
router.get('/trash', folderController.getTrashFolders);
router.post('/:id/restore', folderController.restoreFolder);

// Secret vault
router.post('/:id/move-to-secret', folderController.moveToSecret);

// Basic folder operations
router.post('/', folderController.createFolder);
router.get('/', folderController.getFolders);
router.delete('/:id', folderController.deleteFolder);

module.exports = router;
