import React, { useState, useEffect } from 'react';
import { useSubscription } from '../../context/SubscriptionContext';
import PlanSelectionModal from './PlanSelectionModal';

interface PostLoginPlanSelectorProps {
  onClose?: () => void;
  autoShow?: boolean;
}

const PostLoginPlanSelector: React.FC<PostLoginPlanSelectorProps> = ({ 
  onClose,
  autoShow = true 
}) => {
  const { currentPlan } = useSubscription();
  const [showPlanModal, setShowPlanModal] = useState(false);

  useEffect(() => {
    if (autoShow && currentPlan === 'BASIC') {
      // Show the plan selection modal immediately for Basic users
      setShowPlanModal(true);
    }
  }, [autoShow, currentPlan]);

  return (
    <PlanSelectionModal
      open={showPlanModal}
      onClose={() => {
        setShowPlanModal(false);
        onClose?.();
      }}
      showOnlyUpgrades={false}
    />
  );
};

export default PostLoginPlanSelector;