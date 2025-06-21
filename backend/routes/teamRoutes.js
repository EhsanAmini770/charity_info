const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');
const {
  validateCreateTeamMember,
  validateUpdateTeamMember,
  validateGetTeamMembers,
  validateGetTeamMemberById,
  validateDeleteTeamMember
} = require('../validations/teamValidationFlex');
const { isAuthenticated, isAdmin } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const controllerUtils = require('../utils/controllerUtils');
const debug = require('../utils/debug').createNamespace('team-routes');

// Set up multer storage for team member photos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/team');
    debug.log('Setting upload directory for team member photo', { uploadDir });

    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      debug.log('Creating upload directory', { uploadDir });
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const fileName = 'team-' + uniqueSuffix + ext;
    debug.log('Generated filename for team member photo', { fileName, originalName: file.originalname });
    cb(null, fileName);
  }
});

// File filter to only allow image files
const fileFilter = (req, file, cb) => {
  debug.log('Checking file type for team member photo', { mimetype: file.mimetype, originalName: file.originalname });

  if (file.mimetype.startsWith('image/')) {
    debug.log('File type accepted', { mimetype: file.mimetype });
    cb(null, true);
  } else {
    debug.log('File type rejected', { mimetype: file.mimetype });
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Handle multer errors
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    debug.error('Multer error', err);
    if (err.code === 'LIMIT_FILE_SIZE') {
      const error = new Error('File is too large. Maximum size is 5MB.');
      error.statusCode = 400;
      return controllerUtils.handleControllerError(error, res, {
        context: 'handleMulterError'
      });
    }
    const error = new Error(`Upload error: ${err.message}`);
    error.statusCode = 400;
    return controllerUtils.handleControllerError(error, res, {
      context: 'handleMulterError'
    });
  } else if (err) {
    debug.error('Upload error', err);
    const error = new Error(err.message);
    error.statusCode = 400;
    return controllerUtils.handleControllerError(error, res, {
      context: 'handleMulterError'
    });
  }
  next();
};

// Public routes
router.get('/', validateGetTeamMembers, teamController.getAllTeamMembers);
router.get('/:id', validateGetTeamMemberById, teamController.getTeamMemberById);

// Admin routes
router.post(
  '/',
  isAuthenticated,
  isAdmin,
  upload.single('photo'),
  handleMulterError,
  validateCreateTeamMember,
  teamController.createTeamMember
);

router.put(
  '/:id',
  isAuthenticated,
  isAdmin,
  upload.single('photo'),
  handleMulterError,
  validateUpdateTeamMember,
  teamController.updateTeamMember
);

router.delete(
  '/:id',
  isAuthenticated,
  isAdmin,
  validateDeleteTeamMember,
  teamController.deleteTeamMember
);

// Log all routes
debug.log('Team routes initialized');

module.exports = router;
