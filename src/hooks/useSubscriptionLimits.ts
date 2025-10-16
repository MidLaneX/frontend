import { useSubscription } from '../context/SubscriptionContext';
import { getPlanByType, SUBSCRIPTION_PLANS } from '../constants/subscriptionPlans';
import type { PlanType } from '../types/subscription';

export const useSubscriptionLimits = () => {
  const { subscription, currentPlan, checkLimit, getRemainingQuota } = useSubscription();

  const getCurrentPlanData = () => {
    return getPlanByType(currentPlan);
  };

  const canCreateOrganization = () => {
    return checkLimit('organizations');
  };

  const canAddMember = (organizationCount: number = 1) => {
    return checkLimit('totalMembers', organizationCount);
  };

  const canCreateTeam = (organizationCount: number = 1) => {
    return checkLimit('totalTeams', organizationCount);
  };

  const canCreateProject = (organizationCount: number = 1) => {
    return checkLimit('totalProjects', organizationCount);
  };

  const canUseStorage = (additionalGB: number = 0.1) => {
    return checkLimit('storageUsedGB', additionalGB);
  };

  const canMakeApiRequest = (requestCount: number = 1) => {
    return checkLimit('apiRequestsThisMonth', requestCount);
  };

  const getUsagePercentage = (limitType: keyof NonNullable<typeof subscription>['currentUsage']) => {
    if (!subscription) return 0;
    
    const plan = getCurrentPlanData();
    const currentUsage = subscription.currentUsage[limitType];
    
    let limit: number;
    switch (limitType) {
      case 'organizations':
        limit = plan.limits.organizations;
        break;
      case 'totalMembers':
        limit = plan.limits.membersPerOrganization * subscription.currentUsage.organizations;
        break;
      case 'totalTeams':
        limit = plan.limits.teamsPerOrganization * subscription.currentUsage.organizations;
        break;
      case 'totalProjects':
        limit = plan.limits.projectsPerOrganization * subscription.currentUsage.organizations;
        break;
      case 'storageUsedGB':
        limit = plan.limits.storageGB;
        break;
      case 'apiRequestsThisMonth':
        limit = plan.limits.apiRequestsPerMonth;
        break;
      default:
        return 0;
    }
    
    return Math.min((currentUsage / limit) * 100, 100);
  };

  const isNearLimit = (limitType: keyof NonNullable<typeof subscription>['currentUsage'], threshold: number = 80) => {
    return getUsagePercentage(limitType) >= threshold;
  };

  const getUpgradeRecommendation = (): PlanType | null => {
    if (!subscription) return null;
    
    const currentPlanData = getCurrentPlanData();
    const usage = subscription.currentUsage;
    
    // Check if any usage is near the limit (>90%)
    const orgUsage = (usage.organizations / currentPlanData.limits.organizations) * 100;
    const memberUsage = (usage.totalMembers / (currentPlanData.limits.membersPerOrganization * usage.organizations)) * 100;
    const teamUsage = (usage.totalTeams / (currentPlanData.limits.teamsPerOrganization * usage.organizations)) * 100;
    const projectUsage = (usage.totalProjects / (currentPlanData.limits.projectsPerOrganization * usage.organizations)) * 100;
    const storageUsage = (usage.storageUsedGB / currentPlanData.limits.storageGB) * 100;
    const apiUsage = (usage.apiRequestsThisMonth / currentPlanData.limits.apiRequestsPerMonth) * 100;
    
    const maxUsage = Math.max(orgUsage, memberUsage, teamUsage, projectUsage, storageUsage, apiUsage);
    
    if (maxUsage >= 90) {
      // Recommend next tier
      if (currentPlan === 'BASIC') return 'PREMIUM';
      if (currentPlan === 'PREMIUM') return 'PLUS';
    }
    
    return null;
  };

  const getAllPlans = () => {
    return SUBSCRIPTION_PLANS;
  };

  return {
    subscription,
    currentPlan,
    getCurrentPlanData,
    canCreateOrganization,
    canAddMember,
    canCreateTeam,
    canCreateProject,
    canUseStorage,
    canMakeApiRequest,
    getRemainingQuota,
    getUsagePercentage,
    isNearLimit,
    getUpgradeRecommendation,
    getAllPlans,
  };
};