const { validateRequest } = require('../utils/validationUtils');
const debug = require('../utils/debug').createNamespace('sitemap-validation');

/**
 * Validation rules for XML sitemap
 */
const xmlSitemapRules = [];

/**
 * Validation rules for HTML sitemap
 */
const htmlSitemapRules = [];

/**
 * Middleware for validating XML sitemap
 */
const validateXmlSitemap = validateRequest(xmlSitemapRules);

/**
 * Middleware for validating HTML sitemap
 */
const validateHtmlSitemap = validateRequest(htmlSitemapRules);

module.exports = {
  validateXmlSitemap,
  validateHtmlSitemap
};
