/**
 * Pagination utility functions
 */
const paginationUtils = {
  /**
   * Parse pagination parameters from request query
   * @param {Object} query - Request query object
   * @returns {Object} - Pagination parameters
   */
  getPaginationParams: (query) => {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;
    
    return { page, limit, skip };
  },
  
  /**
   * Get sort parameters from request query
   * @param {Object} query - Request query object
   * @param {Object} defaultSort - Default sort object
   * @returns {Object} - Sort object for mongoose
   */
  getSortParams: (query, defaultSort = { createdAt: -1 }) => {
    if (!query.sort) {
      return defaultSort;
    }
    
    const sortField = query.sort.startsWith('-') 
      ? query.sort.substring(1) 
      : query.sort;
      
    const sortOrder = query.sort.startsWith('-') ? -1 : 1;
    
    return { [sortField]: sortOrder };
  },
  
  /**
   * Create pagination result object
   * @param {Array} data - Data array
   * @param {number} total - Total count
   * @param {number} page - Current page
   * @param {number} limit - Page size
   * @returns {Object} - Pagination result
   */
  createPaginationResult: (data, total, page, limit) => {
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    
    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage,
        hasPrevPage,
        nextPage: hasNextPage ? page + 1 : null,
        prevPage: hasPrevPage ? page - 1 : null
      }
    };
  },
  
  /**
   * Create filter object from request query
   * @param {Object} query - Request query object
   * @param {Array} allowedFields - Allowed filter fields
   * @returns {Object} - Filter object for mongoose
   */
  getFilterParams: (query, allowedFields = []) => {
    const filter = {};
    
    // Add search if provided
    if (query.q) {
      filter.$text = { $search: query.q };
    }
    
    // Add field filters
    allowedFields.forEach(field => {
      if (query[field] !== undefined) {
        filter[field] = query[field];
      }
    });
    
    // Add date range filters
    if (query.startDate || query.endDate) {
      filter.createdAt = {};
      
      if (query.startDate) {
        filter.createdAt.$gte = new Date(query.startDate);
      }
      
      if (query.endDate) {
        filter.createdAt.$lte = new Date(query.endDate);
      }
    }
    
    return filter;
  }
};

module.exports = paginationUtils;
