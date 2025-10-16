export type PlanType = 'BASIC' | 'PREMIUM' | 'PLUS';

export interface PlanLimits {
  organizations: number;
  membersPerOrganization: number;
  teamsPerOrganization: number;
  projectsPerOrganization: number;
  storageGB: number;
  apiRequestsPerMonth: number;
}

export interface SubscriptionPlan {
  id: PlanType;
  name: string;
  description: string;
  price: {
    monthly: number;
    yearly: number;
  };
  limits: PlanLimits;
  features: string[];
  popular?: boolean;
  color: string;
  gradient: string;
}

export interface UserSubscription {
  planType: PlanType;
  billingCycle: 'monthly' | 'yearly';
  startDate: string;
  endDate: string;
  status: 'active' | 'cancelled' | 'expired' | 'trial';
  autoRenew: boolean;
  currentUsage: {
    organizations: number;
    totalMembers: number;
    totalTeams: number;
    totalProjects: number;
    storageUsedGB: number;
    apiRequestsThisMonth: number;
  };
}

export interface PlanUpgradeOptions {
  fromPlan: PlanType;
  toPlan: PlanType;
  proratedAmount?: number;
  effectiveDate: string;
}