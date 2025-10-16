import type { SubscriptionPlan, PlanType } from '../types/subscription';

export const SUBSCRIPTION_PLANS: Record<PlanType, SubscriptionPlan> = {
  BASIC: {
    id: 'BASIC',
    name: 'Basic',
    description: 'Perfect for individuals and small teams getting started',
    price: {
      monthly: 0,
      yearly: 0,
    },
    limits: {
      organizations: 1,
      membersPerOrganization: 5,
      teamsPerOrganization: 2,
      projectsPerOrganization: 10,
      storageGB: 5,
      apiRequestsPerMonth: 1000,
    },
    features: [
      'Up to 5 team members',
      '2 teams per organization',
      '10 projects',
      '5GB storage',
      'Basic project management',
    ],
    color: '#4CAF50',
    gradient: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
  },
  PREMIUM: {
    id: 'PREMIUM',
    name: 'Premium',
    description: 'Ideal for growing teams and organizations',
    price: {
      monthly: 12,
      yearly: 120, // 2 months free
    },
    limits: {
      organizations: 3,
      membersPerOrganization: 25,
      teamsPerOrganization: 10,
      projectsPerOrganization: 50,
      storageGB: 100,
      apiRequestsPerMonth: 10000,
    },
    features: [
      'Up to 25 team members',
      '10 teams per organization',
      '50 projects',
      '100GB storage',
      'Advanced project analytics',
      'Priority email support',
      'API access',
    ],
    popular: true,
    color: '#FF9800',
    gradient: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
  },
  PLUS: {
    id: 'PLUS',
    name: 'Plus',
    description: 'For large organizations with advanced needs',
    price: {
      monthly: 25,
      yearly: 250, // 2 months free
    },
    limits: {
      organizations: 10,
      membersPerOrganization: 100,
      teamsPerOrganization: 50,
      projectsPerOrganization: 200,
      storageGB: 500,
      apiRequestsPerMonth: 100000,
    },
    features: [
      'Up to 100 team members',
      '50 teams per organization',
      '200 projects',
      '500GB storage',
      'Enterprise-grade security',
      '24/7 phone & email support',
      'Custom integrations',
      'Advanced permissions',
    ],
    color: '#9C27B0',
    gradient: 'linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)',
  },
};

export const PLAN_ORDER: PlanType[] = ['BASIC', 'PREMIUM', 'PLUS'];

export const DEFAULT_PLAN: PlanType = 'BASIC';

export const getPlanByType = (planType: PlanType): SubscriptionPlan => {
  return SUBSCRIPTION_PLANS[planType];
};

export const getNextPlan = (currentPlan: PlanType): PlanType | null => {
  const currentIndex = PLAN_ORDER.indexOf(currentPlan);
  return currentIndex < PLAN_ORDER.length - 1 ? PLAN_ORDER[currentIndex + 1] : null;
};

export const getPreviousPlan = (currentPlan: PlanType): PlanType | null => {
  const currentIndex = PLAN_ORDER.indexOf(currentPlan);
  return currentIndex > 0 ? PLAN_ORDER[currentIndex - 1] : null;
};

export const isLimitExceeded = (current: number, limit: number): boolean => {
  return current >= limit;
};

export const getUsagePercentage = (current: number, limit: number): number => {
  return Math.min((current / limit) * 100, 100);
};

export const formatPrice = (price: number): string => {
  return price === 0 ? 'Free' : `$${price}`;
};

export const calculateYearlySavings = (monthlyPrice: number, yearlyPrice: number): number => {
  return (monthlyPrice * 12) - yearlyPrice;
};