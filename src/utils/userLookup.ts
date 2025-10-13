// User lookup utilities for task cards
import type { TeamMemberDetail } from "@/types/api/organizations";
import { createUniqueDisplayName } from "./userAvatars";

/**
 * Create a lookup map from username to user data
 */
export const createUserLookupMap = (teamMembers: TeamMemberDetail[]): Map<string, TeamMemberDetail> => {
  const lookupMap = new Map<string, TeamMemberDetail>();
  
  teamMembers.forEach(member => {
    const displayName = createUniqueDisplayName(member, teamMembers);
    lookupMap.set(displayName, member);
  });
  
  return lookupMap;
};

/**
 * Find user data by username/display name
 */
export const findUserByDisplayName = (
  displayName: string, 
  teamMembers: TeamMemberDetail[]
): TeamMemberDetail | undefined => {
  return teamMembers.find(member => 
    createUniqueDisplayName(member, teamMembers) === displayName
  );
};

/**
 * Create a reverse lookup map from user ID to display name
 */
export const createDisplayNameLookup = (teamMembers: TeamMemberDetail[]): Record<number, string> => {
  const lookup: Record<number, string> = {};
  
  teamMembers.forEach(member => {
    lookup[member.memberId] = createUniqueDisplayName(member, teamMembers);
  });
  
  return lookup;
};