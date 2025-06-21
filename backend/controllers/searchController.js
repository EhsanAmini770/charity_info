const News = require('../models/News');
const GalleryAlbum = require('../models/GalleryAlbum');

// Controller for search functionality
const searchController = {
  // Combined search on News and Gallery Albums
  search: async (req, res, next) => {
    try {
      const query = req.query.q;
      
      if (!query) {
        return res.status(400).json({ message: 'Search query is required' });
      }
      
      // Search in News
      const newsResults = await News.find(
        { $text: { $search: query } },
        { score: { $meta: 'textScore' } }
      )
        .sort({ score: { $meta: 'textScore' } })
        .limit(10)
        .select('title slug publishDate')
        .lean();
      
      // Search in Gallery Albums
      const albumResults = await GalleryAlbum.find(
        { $text: { $search: query } },
        { score: { $meta: 'textScore' } }
      )
        .sort({ score: { $meta: 'textScore' } })
        .limit(10)
        .select('title slug description')
        .lean();
      
      // Combine results
      const results = {
        news: newsResults.map(item => ({
          ...item,
          type: 'news'
        })),
        albums: albumResults.map(item => ({
          ...item,
          type: 'album'
        }))
      };
      
      res.json(results);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = searchController;
