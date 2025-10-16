import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { PlanType, UserSubscription } from '../types/subscription';
import { DEFAULT_PLAN, getPlanByType } from '../constants/subscriptionPlans';
import { useAuth } from './AuthContext';

export interface SubscriptionContextType {
  subscription: UserSubscription | null;
  isLoading: boolean;
  currentPlan: PlanType;
  upgradePlan: (newPlan: PlanType, billingCycle: 'monthly' | 'yearly') => Promise<void>;
  downgradePlan: (newPlan: PlanType) => Promise<void>;
  cancelSubscription: () => Promise<void>;
  reactivateSubscription: () => Promise<void>;
  updateBillingCycle: (billingCycle: 'monthly' | 'yearly') => Promise<void>;
  checkLimit: (limitType: keyof UserSubscription['currentUsage'], requiredAmount?: number) => boolean;
  getRemainingQuota: (limitType: keyof UserSubscription['currentUsage']) => number;
  refreshSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

interface SubscriptionProviderProps {
  children: ReactNode;
}

export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // For demo purposes, we'll create a mock subscription
  // In a real app, this would come from your backend API
  const createMockSubscription = useCallback((planType: PlanType = DEFAULT_PLAN): UserSubscription => {
    const now = new Date();
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 1);

    return {
      planType,
      billingCycle: 'monthly',
      startDate: now.toISOString(),
      endDate: endDate.toISOString(),
      status: 'active',
      autoRenew: true,
      currentUsage: {
        organizations: planType === 'BASIC' ? 1 : planType === 'PREMIUM' ? 2 : 3,
        totalMembers: planType === 'BASIC' ? 3 : planType === 'PREMIUM' ? 15 : 45,
        totalTeams: planType === 'BASIC' ? 1 : planType === 'PREMIUM' ? 5 : 12,
        totalProjects: planType === 'BASIC' ? 5 : planType === 'PREMIUM' ? 23 : 87,
        storageUsedGB: planType === 'BASIC' ? 2.5 : planType === 'PREMIUM' ? 45.7 : 234.8,
        apiRequestsThisMonth: planType === 'BASIC' ? 450 : planType === 'PREMIUM' ? 6750 : 45600,
      },
    };
  }, []);

  const currentPlan = subscription?.planType || DEFAULT_PLAN;

  // Initialize subscription when user is authenticated
  useEffect(() => {
    const initializeSubscription = async () => {
      if (!isAuthenticated || !user) {
        setSubscription(null);
        setIsLoading(false);
        return;
      }

      try {
        // In a real app, you'd fetch this from your backend
        // For now, we'll check localStorage for demo purposes
        const storedPlan = localStorage.getItem(`user_${user.userId}_subscription_plan`) as PlanType;
        const planType = storedPlan || DEFAULT_PLAN;
        
        const mockSubscription = createMockSubscription(planType);
        setSubscription(mockSubscription);
      } catch (error) {
        console.error('Failed to initialize subscription:', error);
        // Fallback to default plan
        setSubscription(createMockSubscription());
      }
      
      setIsLoading(false);
    };

    initializeSubscription();
  }, [isAuthenticated, user, createMockSubscription]);

  const upgradePlan = async (newPlan: PlanType, billingCycle: 'monthly' | 'yearly'): Promise<void> => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      // In a real app, this would be an API call to your backend
      const updatedSubscription = createMockSubscription(newPlan);
      updatedSubscription.billingCycle = billingCycle;
      
      setSubscription(updatedSubscription);
      
      // Store in localStorage for demo persistence
      localStorage.setItem(`user_${user.userId}_subscription_plan`, newPlan);
      
      console.log(`Plan upgraded to ${newPlan} with ${billingCycle} billing`);
    } catch (error) {
      console.error('Failed to upgrade plan:', error);
      throw error;
    }
  };

  const downgradePlan = async (newPlan: PlanType): Promise<void> => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      // In a real app, this would be an API call to your backend
      const updatedSubscription = createMockSubscription(newPlan);
      setSubscription(updatedSubscription);
      
      // Store in localStorage for demo persistence
      localStorage.setItem(`user_${user.userId}_subscription_plan`, newPlan);
      
      console.log(`Plan downgraded to ${newPlan}`);
    } catch (error) {
      console.error('Failed to downgrade plan:', error);
      throw error;
    }
  };

  const cancelSubscription = async (): Promise<void> => {
    if (!subscription) return;
    
    try {
      // In a real app, this would be an API call to your backend
      const updatedSubscription = { ...subscription, status: 'cancelled' as const, autoRenew: false };
      setSubscription(updatedSubscription);
      
      console.log('Subscription cancelled');
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      throw error;
    }
  };

  const reactivateSubscription = async (): Promise<void> => {
    if (!subscription) return;
    
    try {
      // In a real app, this would be an API call to your backend
      const updatedSubscription = { ...subscription, status: 'active' as const, autoRenew: true };
      setSubscription(updatedSubscription);
      
      console.log('Subscription reactivated');
    } catch (error) {
      console.error('Failed to reactivate subscription:', error);
      throw error;
    }
  };

  const updateBillingCycle = async (billingCycle: 'monthly' | 'yearly'): Promise<void> => {
    if (!subscription) return;
    
    try {
      // In a real app, this would be an API call to your backend
      const updatedSubscription = { ...subscription, billingCycle };
      setSubscription(updatedSubscription);
      
      console.log(`Billing cycle updated to ${billingCycle}`);
    } catch (error) {
      console.error('Failed to update billing cycle:', error);
      throw error;
    }
  };

  const checkLimit = (limitType: keyof UserSubscription['currentUsage'], requiredAmount: number = 1): boolean => {
    if (!subscription) return false;
    
    const plan = getPlanByType(currentPlan);
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
        return false;
    }
    
    return (currentUsage + requiredAmount) <= limit;
  };

  const getRemainingQuota = (limitType: keyof UserSubscription['currentUsage']): number => {
    if (!subscription) return 0;
    
    const plan = getPlanByType(currentPlan);
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
    
    return Math.max(0, limit - currentUsage);
  };

  const refreshSubscription = async (): Promise<void> => {
    if (!user || !isAuthenticated) return;
    
    setIsLoading(true);
    try {
      // In a real app, this would fetch fresh data from your backend
      const storedPlan = localStorage.getItem(`user_${user.userId}_subscription_plan`) as PlanType;
      const planType = storedPlan || DEFAULT_PLAN;
      const mockSubscription = createMockSubscription(planType);
      setSubscription(mockSubscription);
    } catch (error) {
      console.error('Failed to refresh subscription:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const value: SubscriptionContextType = {
    subscription,
    isLoading,
    currentPlan,
    upgradePlan,
    downgradePlan,
    cancelSubscription,
    reactivateSubscription,
    updateBillingCycle,
    checkLimit,
    getRemainingQuota,
    refreshSubscription,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};