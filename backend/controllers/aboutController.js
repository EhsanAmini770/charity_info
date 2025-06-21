const About = require('../models/About');
const logger = require('../utils/logger');
const controllerUtils = require('../utils/controllerUtils');
const debug = require('../utils/debug').createNamespace('about-controller');

// Controller for about page
const aboutController = {
  // Get about page content
  getAboutContent: async (req, res, next) => {
    try {
      debug.log('Fetching about page content');

      // Get about content (there should be only one document)
      let aboutContent = await About.findOne();

      // If no content exists yet, create a default one
      if (!aboutContent) {
        debug.log('No about content found, creating default content');

        const defaultContent = {
          mission: 'Our mission is to provide support and resources to those in need within our community.',
          vision: 'Through our dedicated volunteers and generous donors, we strive to make a positive impact.',
          foundedYear: '2010',
          volunteersCount: '100',
          peopleHelpedCount: '1000',
          communitiesCount: '10'
        };

        aboutContent = await About.create(defaultContent);
        debug.log('Default about content created', { id: aboutContent._id });
      } else {
        debug.log('Found existing about content', { id: aboutContent._id });
      }

      res.status(200).json({ aboutContent });
    } catch (error) {
      debug.error('Error fetching about content', error);
      logger.error({
        message: 'Error in getAboutContent controller',
        error: error.message,
        stack: error.stack
      });
      controllerUtils.handleControllerError(error, res, {
        context: 'getAboutContent',
        useNextFunction: true,
        next
      });
    }
  },

  // Update about page content (admin only)
  updateAboutContent: async (req, res, next) => {
    try {
      const aboutData = req.body;
      debug.log('Updating about page content', { fields: Object.keys(aboutData) });

      if (!aboutData || typeof aboutData !== 'object') {
        debug.log('Invalid about data received', { aboutData });
        const error = new Error('Invalid about data');
        error.statusCode = 400;
        return controllerUtils.handleControllerError(error, res, {
          context: 'updateAboutContent'
        });
      }

      // Find existing about content or create new
      let aboutContent = await About.findOne();

      if (aboutContent) {
        debug.log('Updating existing about content', { id: aboutContent._id });

        // Track changes
        const changes = Object.keys(aboutData).filter(key =>
          aboutData[key] !== aboutContent[key]
        );

        // Update existing content
        aboutContent = await About.findByIdAndUpdate(
          aboutContent._id,
          aboutData,
          { new: true }
        );

        debug.log('About content updated successfully', { id: aboutContent._id, changes });
      } else {
        debug.log('No existing about content, creating new');
        // Create new content
        aboutContent = await About.create(aboutData);
        debug.log('New about content created', { id: aboutContent._id });
      }

      res.status(200).json({
        message: 'About page content updated successfully',
        aboutContent
      });
    } catch (error) {
      debug.error('Error updating about content', error);
      logger.error({
        message: 'Error in updateAboutContent controller',
        error: error.message,
        stack: error.stack
      });
      controllerUtils.handleControllerError(error, res, {
        context: 'updateAboutContent',
        useNextFunction: true,
        next
      });
    }
  }
};

module.exports = aboutController;
