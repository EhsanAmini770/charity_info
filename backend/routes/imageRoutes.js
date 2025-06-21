const express = require('express');
const path = require('path');
const fs = require('fs');
const debug = require('../utils/debug').createNamespace('image-routes');
const controllerUtils = require('../utils/controllerUtils');

const router = express.Router();

// Super simple image serving route
router.get('/gallery/:albumId/:filename', (req, res) => {
  try {
    const { albumId, filename } = req.params;

    debug.log('Direct image request:', { albumId, filename });

    const imagePath = path.join(__dirname, `../uploads/gallery/${albumId}/${filename}`);

    if (!fs.existsSync(imagePath)) {
      debug.error(`Image not found at path: ${imagePath}`);
      const error = new Error('Image not found');
      error.statusCode = 404;
      return controllerUtils.handleControllerError(error, res, {
        context: 'serveImage',
        entityId: `${albumId}/${filename}`
      });
    }

    // Disable all security policies for this route
    res.removeHeader('Content-Security-Policy');
    res.removeHeader('X-Content-Security-Policy');
    res.removeHeader('X-WebKit-CSP');

    // Set permissive CORS headers
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET');
    res.header('Cross-Origin-Resource-Policy', 'cross-origin');

    // Set appropriate content type based on file extension
    const ext = path.extname(filename).toLowerCase();
    let contentType = 'application/octet-stream'; // default

    if (ext === '.jpg' || ext === '.jpeg') {
      contentType = 'image/jpeg';
    } else if (ext === '.png') {
      contentType = 'image/png';
    } else if (ext === '.gif') {
      contentType = 'image/gif';
    }

    res.header('Content-Type', contentType);
    res.header('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year

    // Send the file
    res.sendFile(imagePath);
  } catch (error) {
    debug.error('Error serving image directly:', error);
    return controllerUtils.handleControllerError(error, res, {
      context: 'serveImage'
    });
  }
});

module.exports = router;
