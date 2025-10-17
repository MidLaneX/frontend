// Utility functions for generating user avatars and colors

/**
 * Generate a consistent color for a user based on their ID and name
 * This ensures the same user always gets the same color
 */
export const generateUserColor = (userId: number, name: string): string => {
  // Create a unique seed using both userId and name hash
  const nameHash = name.split('').reduce((acc, char) => {
    return ((acc << 5) - acc + char.charCodeAt(0)) & 0xffffffff;
  }, 0);
  
  // Combine userId and name hash for uniqueness
  const seed = Math.abs((userId * 7919) + (nameHash * 31));
  
  // Define a palette of distinct, accessible colors
  const colors = [
    '#1976d2', // Blue
    '#d32f2f', // Red  
    '#388e3c', // Green
    '#f57c00', // Orange
    '#7b1fa2', // Purple
    '#303f9f', // Indigo
    '#c2185b', // Pink
    '#00796b', // Teal
    '#5d4037', // Brown
    '#455a64', // Blue Grey
    '#e64a19', // Deep Orange
    '#512da8', // Deep Purple
    '#00695c', // Dark Teal
    '#bf360c', // Red Orange
    '#4e342e', // Dark Brown
    '#37474f', // Dark Blue Grey
    '#795548', // Brown
    '#607d8b', // Blue Grey
    '#ff5722', // Deep Orange
    '#9c27b0', // Purple
    '#3f51b5', // Indigo
    '#2196f3', // Blue
    '#009688', // Teal
    '#4caf50', // Green
    '#8bc34a', // Light Green
    '#cddc39', // Lime
    '#ffeb3b', // Yellow
    '#ffc107', // Amber
    '#ff9800', // Orange
    '#ff5722', // Deep Orange
    '#e91e63', // Pink
    '#9c27b0', // Purple
  ];
  
  return colors[seed % colors.length];
};

/**
 * Generate unique initials from a user's name and ID
 * This ensures users with same name initials get different avatars
 */
export const generateInitials = (name: string, userId: number, allUsers?: { memberId: number; name: string }[]): string => {
  const words = name.trim().split(/\s+/);
  
  if (words.length === 0) return 'U'; // Fallback for empty names
  
  // Default: first two initials
  let initials = words
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
  
  // If we have multiple users, check for conflicts
  if (allUsers && allUsers.length > 1) {
    // Find users with the same initials
    const conflictingUsers = allUsers.filter(user => {
      if (user.memberId === userId) return false; // Don't include self
      const userWords = user.name.trim().split(/\s+/);
      const userInitials = userWords
        .map(word => word.charAt(0).toUpperCase())
        .slice(0, 2)
        .join('');
      return userInitials === initials;
    });
    
    if (conflictingUsers.length > 0) {
      // Try different combinations to make unique
      if (words.length >= 2) {
        // Try first and last letter of first name
        const firstNameVariation = words[0].charAt(0).toUpperCase() + words[0].slice(-1).toUpperCase();
        const stillConflicting = allUsers.some(user => {
          if (user.memberId === userId) return false;
          const userWords = user.name.trim().split(/\s+/);
          const userFirstNameVariation = userWords[0].charAt(0).toUpperCase() + userWords[0].slice(-1).toUpperCase();
          return userFirstNameVariation === firstNameVariation;
        });
        
        if (!stillConflicting) {
          initials = firstNameVariation;
        } else {
          // Final fallback: add user ID digit
          const idDigit = (userId % 10).toString();
          initials = initials.charAt(0) + idDigit;
        }
      } else {
        // Single name: use first letter + number
        const idDigit = (userId % 10).toString();
        initials = words[0].charAt(0).toUpperCase() + idDigit;
      }
    }
  }
  
  return initials;
};

/**
 * Generate a username from email if no username exists
 */
export const generateUsername = (email: string, name: string): string => {
  // First try to extract username from email
  const emailUsername = email.split('@')[0];
  
  // If email username is meaningful (not just numbers), use it
  if (emailUsername && !/^\d+$/.test(emailUsername) && emailUsername.length > 2) {
    return emailUsername;
  }
  
  // Otherwise, create username from name
  return name
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 12); // Limit length
};

/**
 * Create a unique identifier for display purposes
 * Format: username (if duplicates exist, add #ID)
 */
export const createUniqueDisplayName = (
  user: { memberId: number; name: string; email: string },
  allUsers: { memberId: number; name: string; email: string }[]
): string => {
  const username = generateUsername(user.email, user.name);
  
  // Check if this username is used by other users
  const usersWithSameUsername = allUsers.filter(u => 
    generateUsername(u.email, u.name) === username && u.memberId !== user.memberId
  );
  
  if (usersWithSameUsername.length > 0) {
    // Add unique identifier if there are duplicates
    return `${username}#${user.memberId}`;
  }
  
  return username;
};

/**
 * Get contrast text color (black or white) based on background color
 */
export const getContrastColor = (hexColor: string): string => {
  // Remove # if present
  const color = hexColor.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(color.substr(0, 2), 16);
  const g = parseInt(color.substr(2, 2), 16);
  const b = parseInt(color.substr(4, 2), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  return luminance > 0.5 ? '#000000' : '#ffffff';
};