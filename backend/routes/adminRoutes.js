
const express = require('express');
const { isAuthenticated, isEditor, isAdmin } = require('../middleware/auth');
const newsController = require('../controllers/newsController');
const userController = require('../controllers/userController');
const galleryController = require('../controllers/galleryController');
const csrf = require('../middleware/csrf');
const {
  validateCreateNews,
  validateUpdateNews,
  validateGetNews,
  validateDeleteNews
} = require('../validations/newsValidationFlex');
const {
  validateCreateAlbum,
  validateUpdateAlbum,
  validateGetAlbumById,
  validateDeleteAlbum,
  validateUploadImage,
  validateDeleteImage,
  validateGetAllAlbums
} = require('../validations/galleryValidationFlex');
const {
  validateCreateUser,
  validateUpdateUser,
  validateGetUserById,
  validateDeleteUser,
  validateGetUsers
} = require('../validations/userValidationFlex');
const debug = require('../utils/debug').createNamespace('admin-routes');

const router = express.Router();

// Apply auth middleware to all admin routes
router.use(isAuthenticated);

// Apply CSRF protection to all admin routes
router.use(csrf);

// News routes (editor access)
router.get('/news', isEditor, validateGetNews, newsController.getAllNewsAdmin);
router.post('/news', isEditor, validateCreateNews, newsController.createNews);
router.get('/news/:id', isEditor, validateDeleteNews, newsController.getNewsById);
router.put('/news/:id', isEditor, validateUpdateNews, newsController.updateNews);
router.delete('/news/:id', isEditor, validateDeleteNews, newsController.deleteNews);

// News attachments
router.get('/news/:id/attachments', isEditor, newsController.getAttachments);
router.post('/news/:id/attachments', isEditor, newsController.uploadAttachment);
router.delete('/news/:id/attachments/:attachmentId', isEditor, newsController.deleteAttachment);

// Gallery routes (editor access)
router.get('/gallery/albums', isEditor, validateGetAllAlbums, galleryController.getAllAlbums);
router.post('/gallery/albums', isEditor, validateCreateAlbum, galleryController.createAlbum);
router.get('/gallery/albums/:id', isEditor, validateGetAlbumById, galleryController.getAlbumById);
router.put('/gallery/albums/:id', isEditor, validateUpdateAlbum, galleryController.updateAlbum);
router.delete('/gallery/albums/:id', isEditor, validateDeleteAlbum, galleryController.deleteAlbum);
router.post('/gallery/albums/:id/images', isEditor, validateUploadImage, galleryController.uploadImage);
router.delete('/gallery/images/:id', isEditor, validateDeleteImage, galleryController.deleteImage);

// User routes (super-admin access)
router.get('/users', isAdmin, validateGetUsers, userController.getAllUsers);
router.post('/users', isAdmin, validateCreateUser, userController.createUser);
router.get('/users/:id', isAdmin, validateGetUserById, userController.getUserById);
router.put('/users/:id', isAdmin, validateUpdateUser, userController.updateUser);
router.delete('/users/:id', isAdmin, validateDeleteUser, userController.deleteUser);

module.exports = router;
