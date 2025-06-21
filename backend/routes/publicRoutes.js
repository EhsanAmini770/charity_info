const express = require('express');
const newsController = require('../controllers/newsController');
const galleryController = require('../controllers/galleryController');
const searchController = require('../controllers/searchController');
const sitemapController = require('../controllers/sitemapController');
const {
  validateGetNews,
  validateGetNewsBySlug,
  validateViewAttachmentContent
} = require('../validations/newsValidationFlex');
const {
  validateGetAlbumById,
  validateGetAllAlbums,
  validateGetAlbumBySlug,
  validateServeImage
} = require('../validations/galleryValidationFlex');
const { validateSearch } = require('../validations/searchValidationFlex');
const { validateXmlSitemap, validateHtmlSitemap } = require('../validations/sitemapValidationFlex');
const debug = require('../utils/debug').createNamespace('public-routes');

const router = express.Router();

// News routes
router.get('/news', validateGetNews, newsController.getAllNews);
router.get('/news/attachments/:id/content', validateViewAttachmentContent, newsController.viewAttachmentContent);
router.get('/news/:slug', validateGetNewsBySlug, newsController.getNewsBySlug);

// Gallery routes
router.get('/gallery/albums', validateGetAllAlbums, galleryController.getAllAlbums);
router.get('/gallery/albums/:slug', validateGetAlbumBySlug, galleryController.getAlbumBySlug);
router.get('/gallery/images/:albumId/:filename', validateServeImage, galleryController.serveImage);

// Search route
router.get('/search', validateSearch, searchController.search);

// Sitemap routes
router.get('/sitemap.xml', validateXmlSitemap, sitemapController.getXmlSitemap);
router.get('/sitemap.html', validateHtmlSitemap, sitemapController.getHtmlSitemap);

// Log all routes
debug.log('Public routes initialized');

module.exports = router;
