import React from 'react';
import { Avatar, Tooltip, Box, Typography } from '@mui/material';
import { generateUserColor, generateInitials, getContrastColor } from '../../utils/userAvatars';

interface UserAvatarProps {
  user: {
    memberId: number;
    name: string;
    email: string;
    isTeamLead?: boolean;
  };
  size?: number;
  showTooltip?: boolean;
  showLeadBadge?: boolean;
  displayName?: string;
  allUsers?: { memberId: number; name: string }[]; // For generating unique initials
}

const UserAvatar: React.FC<UserAvatarProps> = ({
  user,
  size = 32,
  showTooltip = true,
  showLeadBadge = true,
  displayName,
  allUsers
}) => {
  const backgroundColor = generateUserColor(user.memberId, user.name);
  const initials = generateInitials(user.name, user.memberId, allUsers);
  const textColor = getContrastColor(backgroundColor);

  const avatar = (
    <Box sx={{ position: 'relative', display: 'inline-block' }}>
      <Avatar
        sx={{
          width: size,
          height: size,
          backgroundColor,
          color: textColor,
          fontSize: size * 0.4,
          fontWeight: 600,
          border: user.isTeamLead ? `2px solid #ffd700` : 'none',
          boxShadow: user.isTeamLead ? '0 0 8px rgba(255, 215, 0, 0.3)' : 'none',
        }}
      >
        {initials}
      </Avatar>
      
      {showLeadBadge && user.isTeamLead && (
        <Box
          sx={{
            position: 'absolute',
            top: -2,
            right: -2,
            width: size * 0.3,
            height: size * 0.3,
            backgroundColor: '#ffd700',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: size * 0.2,
            fontWeight: 'bold',
            color: '#000',
            border: '1px solid white',
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
          }}
        >
          ★
        </Box>
      )}
    </Box>
  );

  if (!showTooltip) {
    return avatar;
  }

  return (
    <Tooltip
      title={
        <Box>
          <Typography variant="body2" fontWeight={600}>
            {user.name}
          </Typography>
          {displayName && (
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              @{displayName}
            </Typography>
          )}
          <Typography variant="caption" sx={{ opacity: 0.8, display: 'block' }}>
            {user.email}
          </Typography>
          {user.isTeamLead && (
            <Typography variant="caption" sx={{ color: '#ffd700', fontWeight: 600 }}>
              Team Lead
            </Typography>
          )}
        </Box>
      }
      arrow
    >
      {avatar}
    </Tooltip>
  );
};

export default UserAvatar;