import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  LinearProgress,
  Chip,
  Divider,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Upgrade as UpgradeIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useSubscription } from '../../context/SubscriptionContext';
import { useSubscriptionLimits } from '../../hooks/useSubscriptionLimits';
import { formatPrice, calculateYearlySavings } from '../../constants/subscriptionPlans';
import PlanSelectionModal from './PlanSelectionModal';

const SubscriptionCard: React.FC = () => {
  const { subscription, currentPlan, updateBillingCycle } = useSubscription();
  const {
    getCurrentPlanData,
    getUsagePercentage,
    isNearLimit,
    getUpgradeRecommendation,
    getRemainingQuota,
  } = useSubscriptionLimits();
  
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [billingLoading, setBillingLoading] = useState(false);

  if (!subscription) {
    return null;
  }

  const currentPlanData = getCurrentPlanData();
  const upgradeRecommendation = getUpgradeRecommendation();
  const isYearly = subscription.billingCycle === 'yearly';
  const price = isYearly ? currentPlanData.price.yearly : currentPlanData.price.monthly;

  const handleBillingCycleChange = async () => {
    setBillingLoading(true);
    try {
      await updateBillingCycle(isYearly ? 'monthly' : 'yearly');
    } catch (error) {
      console.error('Failed to update billing cycle:', error);
    } finally {
      setBillingLoading(false);
    }
  };

  const usageItems = [
    {
      label: 'Organizations',
      current: subscription.currentUsage.organizations,
      limit: currentPlanData.limits.organizations,
      type: 'organizations' as const,
    },
    {
      label: 'Team Members',
      current: subscription.currentUsage.totalMembers,
      limit: currentPlanData.limits.membersPerOrganization * subscription.currentUsage.organizations,
      type: 'totalMembers' as const,
    },
    {
      label: 'Teams',
      current: subscription.currentUsage.totalTeams,
      limit: currentPlanData.limits.teamsPerOrganization * subscription.currentUsage.organizations,
      type: 'totalTeams' as const,
    },
    {
      label: 'Projects',
      current: subscription.currentUsage.totalProjects,
      limit: currentPlanData.limits.projectsPerOrganization * subscription.currentUsage.organizations,
      type: 'totalProjects' as const,
    },
    {
      label: 'Storage',
      current: subscription.currentUsage.storageUsedGB,
      limit: currentPlanData.limits.storageGB,
      type: 'storageUsedGB' as const,
      unit: 'GB',
    },
    {
      label: 'API Requests (This Month)',
      current: subscription.currentUsage.apiRequestsThisMonth,
      limit: currentPlanData.limits.apiRequestsPerMonth,
      type: 'apiRequestsThisMonth' as const,
      format: (value: number) => value.toLocaleString(),
    },
  ];

  return (
    <>
      <Card elevation={2} sx={{ borderRadius: 3, overflow: 'visible' }}>
        <CardContent sx={{ p: 4 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: currentPlanData.gradient,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 900,
                    fontSize: '20px',
                  }}
                >
                  {currentPlanData.name.charAt(0)}
                </Box>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
                    {currentPlanData.name} Plan
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={subscription.status}
                      size="small"
                      sx={{
                        bgcolor: subscription.status === 'active' ? 'success.main' : 'warning.main',
                        color: 'white',
                        fontWeight: 600,
                        textTransform: 'capitalize',
                      }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {formatPrice(price)}{price > 0 && `/${isYearly ? 'year' : 'month'}`}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Billing settings">
                <IconButton size="small" sx={{ color: 'text.secondary' }}>
                  <SettingsIcon />
                </IconButton>
              </Tooltip>
              <Button
                variant="outlined"
                size="small"
                onClick={() => setShowPlanModal(true)}
                startIcon={<UpgradeIcon />}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                Change Plan
              </Button>
            </Box>
          </Box>

          {/* Upgrade Recommendation */}
          {upgradeRecommendation && (
            <Alert
              severity="info"
              icon={<TrendingUpIcon />}
              sx={{ mb: 3, borderRadius: 2 }}
              action={
                <Button
                  size="small"
                  onClick={() => setShowPlanModal(true)}
                  sx={{ textTransform: 'none', fontWeight: 600 }}
                >
                  Upgrade
                </Button>
              }
            >
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Consider upgrading to {upgradeRecommendation}
              </Typography>
              <Typography variant="caption">
                You're approaching your current plan limits
              </Typography>
            </Alert>
          )}

          {/* Billing Cycle Savings */}
          {currentPlan !== 'BASIC' && !isYearly && (
            <Alert
              severity="success"
              icon={<InfoIcon />}
              sx={{ mb: 3, borderRadius: 2 }}
              action={
                <Button
                  size="small"
                  onClick={handleBillingCycleChange}
                  disabled={billingLoading}
                  sx={{ textTransform: 'none', fontWeight: 600 }}
                >
                  Switch to Yearly
                </Button>
              }
            >
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Save ${calculateYearlySavings(currentPlanData.price.monthly, currentPlanData.price.yearly)} per year
              </Typography>
              <Typography variant="caption">
                Switch to yearly billing and get 2 months free
              </Typography>
            </Alert>
          )}

          <Divider sx={{ my: 3 }} />

          {/* Usage Statistics */}
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            Current Usage
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {usageItems.map((item) => {
              const percentage = getUsagePercentage(item.type);
              const isWarning = isNearLimit(item.type, 90);
              const remaining = getRemainingQuota(item.type);
              
              return (
                <Box key={item.label}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {item.label}
                      </Typography>
                      {isWarning && (
                        <Tooltip title="Approaching limit">
                          <WarningIcon sx={{ fontSize: 16, color: 'warning.main' }} />
                        </Tooltip>
                      )}
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {item.format ? item.format(item.current) : item.current.toFixed(item.unit ? 1 : 0)}{item.unit && ` ${item.unit}`} / {item.format ? item.format(item.limit) : item.limit.toFixed(item.unit ? 1 : 0)}{item.unit && ` ${item.unit}`}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={percentage}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: 'grey.200',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                        background: isWarning
                          ? 'linear-gradient(90deg, #ff9800, #f57c00)'
                          : percentage > 50
                          ? currentPlanData.gradient
                          : 'linear-gradient(90deg, #4caf50, #45a049)',
                      },
                    }}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      {percentage.toFixed(1)}% used
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {remaining.toFixed(item.unit ? 1 : 0)}{item.unit && ` ${item.unit}`} remaining
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>

          {/* Plan Features Summary */}
          <Divider sx={{ my: 3 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            Plan Features
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {currentPlanData.features.slice(0, 6).map((feature, index) => (
              <Chip
                key={index}
                label={feature}
                size="small"
                variant="outlined"
                sx={{
                  borderColor: currentPlanData.color,
                  color: currentPlanData.color,
                  fontSize: '12px',
                }}
              />
            ))}
            {currentPlanData.features.length > 6 && (
              <Chip
                label={`+${currentPlanData.features.length - 6} more`}
                size="small"
                sx={{
                  bgcolor: 'grey.100',
                  color: 'text.secondary',
                  fontSize: '12px',
                }}
              />
            )}
          </Box>
        </CardContent>
      </Card>

      <PlanSelectionModal
        open={showPlanModal}
        onClose={() => setShowPlanModal(false)}
      />
    </>
  );
};

export default SubscriptionCard;