const path = require('path');
const fs = require('fs');
const sitemapService = require('../services/sitemapService');

// Controller for sitemap
const sitemapController = {
  // Serve XML sitemap
  getXmlSitemap: async (req, res, next) => {
    try {
      const sitemapPath = path.join(__dirname, '../public/sitemap.xml');
      
      // Check if sitemap exists, if not generate it
      if (!fs.existsSync(sitemapPath)) {
        await sitemapService.regenerateSitemap();
      }
      
      res.header('Content-Type', 'application/xml');
      res.sendFile(sitemapPath);
    } catch (error) {
      next(error);
    }
  },
  
  // Serve HTML sitemap
  getHtmlSitemap: async (req, res, next) => {
    try {
      const sitemapPath = path.join(__dirname, '../public/sitemap.html');
      
      // Check if sitemap exists, if not generate it
      if (!fs.existsSync(sitemapPath)) {
        await sitemapService.regenerateSitemap();
      }
      
      res.header('Content-Type', 'text/html');
      res.sendFile(sitemapPath);
    } catch (error) {
      next(error);
    }
  },
  
  // Manually regenerate sitemap (admin only)
  regenerateSitemap: async (req, res, next) => {
    try {
      await sitemapService.regenerateSitemap();
      res.json({ message: 'Sitemap regenerated successfully' });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = sitemapController;
