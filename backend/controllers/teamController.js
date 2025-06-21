const Team = require('../models/Team');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');
const controllerUtils = require('../utils/controllerUtils');
const debug = require('../utils/debug').createNamespace('team-controller');

// Get all team members
exports.getAllTeamMembers = async (req, res, next) => {
  try {
    debug.log('Fetching all team members', { query: req.query });

    // Filter by active status for public requests
    const filter = req.query.includeInactive === 'true' ? {} : { active: true };
    debug.log('Using filter', { filter, includeInactive: req.query.includeInactive });

    // Sort by displayOrder and then by name
    const teamMembers = await Team.find(filter).sort({ displayOrder: 1, name: 1 });
    debug.log(`Found ${teamMembers.length} team members`);

    res.status(200).json(teamMembers);
  } catch (error) {
    debug.error('Error fetching all team members', error);
    logger.error('Error in getAllTeamMembers controller:', error);
    controllerUtils.handleControllerError(error, res, {
      context: 'getAllTeamMembers',
      useNextFunction: true,
      next
    });
  }
};

// Get team member by ID
exports.getTeamMemberById = async (req, res, next) => {
  try {
    const { id } = req.params;
    debug.log('Fetching team member by ID', { id });

    const teamMember = await Team.findById(id);

    if (!teamMember) {
      debug.log('Team member not found', { id });
      return res.status(404).json({ message: 'Team member not found' });
    }

    debug.log('Found team member', { id: teamMember._id, name: teamMember.name });
    res.status(200).json(teamMember);
  } catch (error) {
    debug.error('Error fetching team member by ID', error);
    logger.error('Error in getTeamMemberById controller:', error);
    controllerUtils.handleControllerError(error, res, {
      context: 'getTeamMemberById',
      entityId: req.params.id,
      useNextFunction: true,
      next
    });
  }
};

// Create new team member
exports.createTeamMember = async (req, res, next) => {
  try {
    debug.log('Creating new team member', { body: req.body, file: req.file ? req.file.filename : 'none' });

    const {
      name,
      position,
      bio,
      email,
      phone,
      socialLinks,
      displayOrder,
      active
    } = req.body;

    // Handle photo upload if present
    let photoPath = '';
    if (req.file) {
      photoPath = `/uploads/team/${req.file.filename}`;
      debug.log('Photo path created', { photoPath });
    }

    // Parse socialLinks if it's a string
    let parsedSocialLinks = {};
    if (socialLinks) {
      if (typeof socialLinks === 'string') {
        try {
          parsedSocialLinks = JSON.parse(socialLinks);
          debug.log('Parsed social links', { parsedSocialLinks });
        } catch (error) {
          debug.error('Error parsing social links', error);
          // Continue with empty social links if parsing fails
        }
      } else {
        parsedSocialLinks = socialLinks;
      }
    }

    // Convert string values to appropriate types
    const parsedDisplayOrder = displayOrder ? parseInt(displayOrder) : 0;
    const parsedActive = active !== 'false' && active !== false;

    const newTeamMember = new Team({
      name,
      position,
      bio,
      photo: photoPath,
      email,
      phone,
      socialLinks: parsedSocialLinks,
      displayOrder: parsedDisplayOrder,
      active: parsedActive
    });

    await newTeamMember.save();
    debug.log('Team member created successfully', { id: newTeamMember._id, name: newTeamMember.name });

    res.status(201).json({
      message: 'Team member created successfully',
      teamMember: newTeamMember
    });
  } catch (error) {
    debug.error('Error creating team member', error);
    logger.error('Error in createTeamMember controller:', error);
    controllerUtils.handleControllerError(error, res, {
      context: 'createTeamMember',
      useNextFunction: true,
      next
    });
  }
};

// Update team member
exports.updateTeamMember = async (req, res, next) => {
  try {
    const { id } = req.params;
    debug.log('Updating team member', { id, body: req.body, file: req.file ? req.file.filename : 'none' });

    const {
      name,
      position,
      bio,
      email,
      phone,
      socialLinks,
      displayOrder,
      active
    } = req.body;

    const teamMember = await Team.findById(id);

    if (!teamMember) {
      debug.log('Team member not found', { id });
      return res.status(404).json({ message: 'Team member not found' });
    }

    debug.log('Found team member to update', { id: teamMember._id, name: teamMember.name });

    // Track changes
    const changes = [];

    // Handle photo upload if present
    let photoPath = teamMember.photo;
    if (req.file) {
      // Delete old photo if exists
      if (teamMember.photo) {
        const oldPhotoPath = path.join(__dirname, '..', teamMember.photo);
        debug.log('Attempting to delete old photo', { path: oldPhotoPath });

        try {
          if (fs.existsSync(oldPhotoPath)) {
            fs.unlinkSync(oldPhotoPath);
            debug.log('Deleted old photo', { path: oldPhotoPath });
          } else {
            debug.log('Old photo not found', { path: oldPhotoPath });
          }
        } catch (fileError) {
          debug.error('Error deleting old photo', fileError);
        }
      }

      photoPath = `/uploads/team/${req.file.filename}`;
      changes.push('photo');
      debug.log('Updated photo path', { newPhoto: photoPath });
    }

    // Update fields
    if (name !== undefined && name !== teamMember.name) {
      teamMember.name = name;
      changes.push('name');
    }

    if (position !== undefined && position !== teamMember.position) {
      teamMember.position = position;
      changes.push('position');
    }

    if (bio !== undefined && bio !== teamMember.bio) {
      teamMember.bio = bio;
      changes.push('bio');
    }

    teamMember.photo = photoPath;

    if (email !== undefined && email !== teamMember.email) {
      teamMember.email = email;
      changes.push('email');
    }

    if (phone !== undefined && phone !== teamMember.phone) {
      teamMember.phone = phone;
      changes.push('phone');
    }

    // Parse socialLinks if it's a string
    if (socialLinks) {
      let parsedSocialLinks = {};
      if (typeof socialLinks === 'string') {
        try {
          parsedSocialLinks = JSON.parse(socialLinks);
          debug.log('Parsed social links', { parsedSocialLinks });
          teamMember.socialLinks = parsedSocialLinks;
          changes.push('socialLinks');
        } catch (parseError) {
          debug.error('Error parsing social links', parseError);
        }
      } else {
        teamMember.socialLinks = socialLinks;
        changes.push('socialLinks');
      }
    }

    if (displayOrder !== undefined) {
      const parsedDisplayOrder = parseInt(displayOrder);
      if (parsedDisplayOrder !== teamMember.displayOrder) {
        teamMember.displayOrder = parsedDisplayOrder;
        changes.push('displayOrder');
      }
    }

    if (active !== undefined) {
      const parsedActive = active === 'true' || active === true;
      if (parsedActive !== teamMember.active) {
        teamMember.active = parsedActive;
        changes.push('active');
      }
    }

    if (changes.length > 0) {
      await teamMember.save();
      debug.log('Team member updated successfully', { id: teamMember._id, changes });
    } else {
      debug.log('No changes to update', { id });
    }

    res.status(200).json({
      message: 'Team member updated successfully',
      teamMember,
      changes: changes.length > 0 ? changes : null
    });
  } catch (error) {
    debug.error('Error updating team member', error);
    logger.error('Error in updateTeamMember controller:', error);
    controllerUtils.handleControllerError(error, res, {
      context: 'updateTeamMember',
      entityId: req.params.id,
      useNextFunction: true,
      next
    });
  }
};

// Delete team member
exports.deleteTeamMember = async (req, res, next) => {
  try {
    const { id } = req.params;
    debug.log('Deleting team member', { id });

    const teamMember = await Team.findById(id);

    if (!teamMember) {
      debug.log('Team member not found', { id });
      return res.status(404).json({ message: 'Team member not found' });
    }

    debug.log('Found team member to delete', { id: teamMember._id, name: teamMember.name });

    // Delete photo if exists
    let fileDeleted = false;
    if (teamMember.photo) {
      const photoPath = path.join(__dirname, '..', teamMember.photo);
      debug.log('Attempting to delete photo file', { path: photoPath });

      try {
        if (fs.existsSync(photoPath)) {
          fs.unlinkSync(photoPath);
          debug.log('Deleted photo file', { path: photoPath });
          fileDeleted = true;
        } else {
          debug.log('Photo file not found', { path: photoPath });
        }
      } catch (fileError) {
        debug.error('Error deleting photo file', fileError);
      }
    }

    await Team.deleteOne({ _id: id });
    debug.log('Team member record deleted', { id });

    res.status(200).json({
      message: 'Team member deleted successfully',
      name: teamMember.name,
      fileDeleted
    });
  } catch (error) {
    debug.error('Error deleting team member', error);
    logger.error('Error in deleteTeamMember controller:', error);
    controllerUtils.handleControllerError(error, res, {
      context: 'deleteTeamMember',
      entityId: req.params.id,
      useNextFunction: true,
      next
    });
  }
};
