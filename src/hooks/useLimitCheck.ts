import { useState, useCallback } from 'react';
import { useSubscription } from '../context/SubscriptionContext';
import type { UserSubscription } from '../types/subscription';

export const useLimitCheck = () => {
  const { checkLimit: checkSubscriptionLimit } = useSubscription();
  const [showLimitDialog, setShowLimitDialog] = useState(false);
  const [limitExceededInfo, setLimitExceededInfo] = useState<{
    limitType: keyof UserSubscription['currentUsage'];
    actionName: string;
    currentCount: number;
  } | null>(null);

  const checkLimit = useCallback((
    limitType: keyof UserSubscription['currentUsage'],
    actionName: string,
    requiredAmount: number = 1
  ): boolean => {
    const canProceed = checkSubscriptionLimit(limitType, requiredAmount);
    
    if (!canProceed) {
      setLimitExceededInfo({
        limitType,
        actionName,
        currentCount: requiredAmount,
      });
      setShowLimitDialog(true);
      return false;
    }
    
    return true;
  }, [checkSubscriptionLimit]);

  const closeLimitDialog = useCallback(() => {
    setShowLimitDialog(false);
    setLimitExceededInfo(null);
  }, []);

  return {
    checkLimit,
    showLimitDialog,
    limitExceededInfo,
    closeLimitDialog,
  };
};