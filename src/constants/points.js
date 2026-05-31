/**
 * Points & Gamification System Constants
 * Defines point values for all user actions in the [Platform Name] platform
 */

// ═══════════════════════════════════════════════════════════════════
// Points Awarding Values
// ═══════════════════════════════════════════════════════════════════

export const POINTS = {
  // Content Creation
  PUBLISH_ARTICLE: 10,

  // Peer Review
  SUBMIT_REVIEW: 5,

  // Engagement (received from others)
  RECEIVE_BOOKMARK: 3,
  RECEIVE_LIKE: 2,
  RECEIVE_COMMENT: 1,
};

// ═══════════════════════════════════════════════════════════════════
// Point Reason Types (for backend reference)
// ═══════════════════════════════════════════════════════════════════

export const POINT_REASONS = {
  PUBLISH_ARTICLE: 'publish_article',
  SUBMIT_REVIEW: 'submit_review',
  RECEIVE_BOOKMARK: 'receive_bookmark',
  RECEIVE_LIKE: 'receive_like',
  RECEIVE_COMMENT: 'receive_comment',
};

// ═══════════════════════════════════════════════════════════════════
// Point Configuration with UI Display Properties
// ═══════════════════════════════════════════════════════════════════

export const POINTS_CONFIG = {
  [POINT_REASONS.PUBLISH_ARTICLE]: {
    label: 'Publish Article',
    description: 'Publishing an article gives you +10 points',
    points: POINTS.PUBLISH_ARTICLE,
    icon: 'FileText',
    color: 'text-accent',
    bgColor: 'bg-accent/10',
    category: 'content',
  },
  [POINT_REASONS.SUBMIT_REVIEW]: {
    label: 'Submit Review',
    description: 'Submitting a peer review gives you +5 points',
    points: POINTS.SUBMIT_REVIEW,
    icon: 'MessageSquare',
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    category: 'review',
  },
  [POINT_REASONS.RECEIVE_BOOKMARK]: {
    label: 'Receive Bookmark',
    description: 'Each bookmark on your articles gives you +3 points',
    points: POINTS.RECEIVE_BOOKMARK,
    icon: 'Bookmark',
    color: 'text-amber-500',
    bgColor: 'bg-amber-50',
    category: 'engagement',
  },
  [POINT_REASONS.RECEIVE_LIKE]: {
    label: 'Receive Like',
    description: 'Each like on your articles gives you +2 points',
    points: POINTS.RECEIVE_LIKE,
    icon: 'Heart',
    color: 'text-pink-500',
    bgColor: 'bg-pink-50',
    category: 'engagement',
  },
  [POINT_REASONS.RECEIVE_COMMENT]: {
    label: 'Receive Comment',
    description: 'Each comment received gives you +1 point',
    points: POINTS.RECEIVE_COMMENT,
    icon: 'MessageCircle',
    color: 'text-purple-500',
    bgColor: 'bg-purple-50',
    category: 'engagement',
  },
};

// ═══════════════════════════════════════════════════════════════════
// Helper Functions
// ═══════════════════════════════════════════════════════════════════

/**
 * Get point configuration by reason key
 * @param {string} reason - The point reason key
 * @returns {Object} Point configuration object
 */
export const getPointsConfig = (reason) => {
  return POINTS_CONFIG[reason] || {
    label: 'Activity',
    description: 'Points earned from activity',
    points: 0,
    icon: 'Zap',
    color: 'text-gray-400',
    bgColor: 'bg-gray-50',
    category: 'other',
  };
};

/**
 * Calculate points for publishing multiple articles
 * @param {number} count - Number of articles
 * @returns {number} Total points
 */
export const calculatePublishPoints = (count) => count * POINTS.PUBLISH_ARTICLE;

/**
 * Calculate points for receiving likes
 * @param {number} count - Number of likes
 * @returns {number} Total points
 */
export const calculateLikePoints = (count) => count * POINTS.RECEIVE_LIKE;

/**
 * Calculate points for receiving bookmarks
 * @param {number} count - Number of bookmarks
 * @returns {number} Total points
 */
export const calculateBookmarkPoints = (count) => count * POINTS.RECEIVE_BOOKMARK;

/**
 * Calculate points for submitting reviews
 * @param {number} count - Number of reviews
 * @returns {number} Total points
 */
export const calculateReviewPoints = (count) => count * POINTS.SUBMIT_REVIEW;

/**
 * Get all point earning opportunities as an array
 * @returns {Array} Array of point config objects
 */
export const getAllPointOpportunities = () => Object.values(POINTS_CONFIG);

/**
 * Get total points that can be earned from a single article (max potential)
 * @returns {number} Maximum points per article
 */
export const getMaxPointsPerArticle = () => {
  return POINTS.PUBLISH_ARTICLE;
};

/**
 * Format points display with proper pluralization
 * @param {number} points - Points value
 * @returns {string} Formatted points string
 */
export const formatPoints = (points) => {
  if (points === 1) return '+1 pt';
  return `+${points} pts`;
};

export default {
  POINTS,
  POINT_REASONS,
  POINTS_CONFIG,
  getPointsConfig,
  calculatePublishPoints,
  calculateLikePoints,
  calculateBookmarkPoints,
  calculateReviewPoints,
  getAllPointOpportunities,
  getMaxPointsPerArticle,
  formatPoints,
};
