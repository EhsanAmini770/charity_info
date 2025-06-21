const { SitemapStream, streamToPromise } = require('sitemap');
const fs = require('fs');
const { createWriteStream } = fs;
const { Readable } = require('stream');
const path = require('path');
const News = require('../models/News');
const GalleryAlbum = require('../models/GalleryAlbum');
const debug = require('../utils/debug').createNamespace('sitemap-service');

// Ensure public directory exists
const ensurePublicDirExists = () => {
  const publicDir = path.join(__dirname, '../public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
};

// Service to generate and save sitemap
const sitemapService = {
  // Regenerate sitemap XML and HTML
  regenerateSitemap: async () => {
    try {
      // Ensure public directory exists
      ensurePublicDirExists();
      // Fetch all news and gallery albums
      const news = await News.find({}).select('slug updatedAt').lean();
      const albums = await GalleryAlbum.find({}).select('slug updatedAt').lean();

      // Create sitemap stream
      const sitemapStream = new SitemapStream({ hostname: process.env.SITE_URL || 'http://localhost:5000' });

      // Add static pages
      sitemapStream.write({ url: '/', changefreq: 'daily', priority: 1.0 });
      sitemapStream.write({ url: '/news', changefreq: 'daily', priority: 0.9 });
      sitemapStream.write({ url: '/gallery', changefreq: 'weekly', priority: 0.8 });
      sitemapStream.write({ url: '/about', changefreq: 'monthly', priority: 0.7 });
      sitemapStream.write({ url: '/contact', changefreq: 'monthly', priority: 0.7 });

      // Add news articles
      news.forEach(article => {
        sitemapStream.write({
          url: `/news/${article.slug}`,
          lastmod: article.updatedAt.toISOString(),
          changefreq: 'weekly',
          priority: 0.8
        });
      });

      // Add gallery albums
      albums.forEach(album => {
        sitemapStream.write({
          url: `/gallery/${album.slug}`,
          lastmod: album.updatedAt.toISOString(),
          changefreq: 'monthly',
          priority: 0.7
        });
      });

      // End the stream
      sitemapStream.end();

      // Generate XML
      const xmlData = await streamToPromise(sitemapStream);

      // Save XML sitemap
      const xmlPath = path.join(__dirname, '../public/sitemap.xml');
      const xmlWriteStream = createWriteStream(xmlPath);
      xmlWriteStream.write(xmlData.toString());
      xmlWriteStream.end();

      // Generate HTML sitemap (simplified version)
      let htmlSitemap = '<html><head><title>Sitemap</title></head><body>';
      htmlSitemap += '<h1>Sitemap</h1>';

      // Static pages
      htmlSitemap += '<h2>Main Pages</h2><ul>';
      htmlSitemap += '<li><a href="/">Home</a></li>';
      htmlSitemap += '<li><a href="/news">News</a></li>';
      htmlSitemap += '<li><a href="/gallery">Gallery</a></li>';
      htmlSitemap += '<li><a href="/about">About</a></li>';
      htmlSitemap += '<li><a href="/contact">Contact</a></li>';
      htmlSitemap += '</ul>';

      // News articles
      htmlSitemap += '<h2>News Articles</h2><ul>';
      news.forEach(article => {
        htmlSitemap += `<li><a href="/news/${article.slug}">${article.slug}</a></li>`;
      });
      htmlSitemap += '</ul>';

      // Gallery albums
      htmlSitemap += '<h2>Gallery Albums</h2><ul>';
      albums.forEach(album => {
        htmlSitemap += `<li><a href="/gallery/${album.slug}">${album.slug}</a></li>`;
      });
      htmlSitemap += '</ul>';

      htmlSitemap += '</body></html>';

      // Save HTML sitemap
      const htmlPath = path.join(__dirname, '../public/sitemap.html');
      const htmlWriteStream = createWriteStream(htmlPath);
      htmlWriteStream.write(htmlSitemap);
      htmlWriteStream.end();

      debug.log('Sitemap regenerated successfully');
      return { success: true };
    } catch (error) {
      debug.error('Error generating sitemap:', error);
      throw error;
    }
  }
};

module.exports = sitemapService;
