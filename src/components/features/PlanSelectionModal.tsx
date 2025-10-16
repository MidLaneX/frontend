import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  CircularProgress,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ToggleButtonGroup,
  ToggleButton,
  styled,
  Divider,
} from '@mui/material';
import {
  Close as CloseIcon,
  Check as CheckIcon,
  StarRate as StarIcon,
} from '@mui/icons-material';
import { useSubscription } from '../../context/SubscriptionContext';
import { useSubscriptionLimits } from '../../hooks/useSubscriptionLimits';
import { PLAN_ORDER, formatPrice, calculateYearlySavings } from '../../constants/subscriptionPlans';
import type { PlanType } from '../../types/subscription';

interface PlanSelectionModalProps {
  open: boolean;
  onClose: () => void;
  showOnlyUpgrades?: boolean;
}

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.grey[100],
  borderRadius: 16,
  border: `1px solid ${theme.palette.divider}`,
  '& .MuiToggleButtonGroup-grouped': {
    margin: 2,
    border: 0,
    '&.Mui-disabled': {
      border: 0,
    },
    '&:not(:first-of-type)': {
      borderRadius: 16,
    },
    '&:first-of-type': {
      borderRadius: 16,
    },
  },
}));

const StyledToggleButton = styled(ToggleButton)(({ theme }) => ({
  padding: '6px 14px',
  borderRadius: '16px !important',
  color: theme.palette.text.primary,
  fontWeight: 600,
  fontSize: '0.85rem',
  transition: 'all 0.25s ease',
  textTransform: 'none',
  '&.Mui-selected, &.Mui-selected:hover': {
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.paper : 'rgba(255,255,255,0.9)',
    color: theme.palette.primary.main,
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  },
}));

const PlanSelectionModal: React.FC<PlanSelectionModalProps> = ({ 
  open, 
  onClose, 
  showOnlyUpgrades = false 
}) => {
  const { currentPlan, upgradePlan, isLoading } = useSubscription();
  const { getAllPlans } = useSubscriptionLimits();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const isYearly = billingCycle === 'yearly';

  const handleBillingCycleChange = (
    _event: React.MouseEvent<HTMLElement>,
    newAlignment: 'monthly' | 'yearly' | null,
  ) => {
    if (newAlignment !== null) {
      setBillingCycle(newAlignment);
    }
  };

  const allPlans = getAllPlans();
  const currentPlanIndex = PLAN_ORDER.indexOf(currentPlan);

  const handleUpgrade = async (planType: PlanType) => {
    if (planType === currentPlan) {
      onClose();
      return;
    }

    try {
      await upgradePlan(planType, billingCycle);
      onClose();
    } catch (error) {
      console.error('Failed to upgrade plan:', error);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: '90vh',
          bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(18,18,18,0.7)' : 'rgba(255,255,255,0.6)',
          backdropFilter: 'saturate(180%) blur(12px)',
          border: theme => `1px solid ${theme.palette.divider}`,
          boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
        },
      }}
    >
      <DialogTitle sx={{ 
        textAlign: 'center',
        pt: 3,
        pb: 1.5,
      }}>
        <Typography 
          variant="h5" 
          sx={{ 
            fontWeight: 700, 
            color: theme => theme.palette.mode === 'dark' ? theme.palette.grey[100] : '#0a1929',
            fontSize: { xs: '1.25rem', sm: '1.5rem' }
          }}
        >
          {showOnlyUpgrades ? 'Upgrade Your Plan' : 'Find the Right Plan for You'}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1, fontWeight: 400 }}>
          Choose the plan that best fits your team's needs and scale.
        </Typography>
        <IconButton onClick={onClose} sx={{ position: 'absolute', top: 12, right: 12 }} aria-label="Close">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: { xs: 2, sm: 3 }, pb: 3 }}>
        {/* Billing Toggle */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          my: 3,
          gap: 2
        }}>
          <StyledToggleButtonGroup
            value={billingCycle}
            exclusive
            onChange={handleBillingCycleChange}
            aria-label="billing cycle"
          >
            <StyledToggleButton value="monthly" aria-label="monthly billing">
              Bill Monthly
            </StyledToggleButton>
            <StyledToggleButton value="yearly" aria-label="yearly billing">
              Bill Yearly
            </StyledToggleButton>
          </StyledToggleButtonGroup>
          {isYearly && (
            <Chip 
              label="2 Months Free" 
              size="small" 
              sx={{ 
                bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(2,132,199,0.15)' : '#e0f2fe', 
                color: '#0284c7', 
                fontWeight: 700,
                fontSize: '12px',
                ml: 1,
              }} 
            />
          )}
        </Box>

        {/* Plan Cards */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: {
            xs: '1fr',
            md: 'repeat(2, 1fr)',
            lg: 'repeat(3, 1fr)'
          }, 
          gap: 3
        }}>
          {PLAN_ORDER.map((planType) => {
            const plan = allPlans[planType];
            const isCurrentPlan = planType === currentPlan;
            const isPopular = plan.popular;
            const price = isYearly ? plan.price.yearly : plan.price.monthly;
            const savings = isYearly ? calculateYearlySavings(plan.price.monthly, plan.price.yearly) : 0;

            if (showOnlyUpgrades && PLAN_ORDER.indexOf(planType) <= currentPlanIndex) {
              return null;
            }

            return (
              <Card
                key={planType}
                elevation={0}
                sx={{
                  position: 'relative',
                  border: '1px solid',
                  borderColor: isPopular ? 'primary.light' : 'divider',
                  borderRadius: 3,
                  transition: 'all 0.25s ease-in-out',
                  display: 'flex',
                  flexDirection: 'column',
                  bgcolor: theme => theme.palette.background.paper,
                  ...(isPopular && {
                    boxShadow: '0 10px 22px -10px rgba(0, 118, 255, 0.25)',
                  }),
                  '&:hover': {
                    boxShadow: isCurrentPlan ? undefined : '0 8px 20px -6px rgba(0,0,0,0.12)',
                    transform: isCurrentPlan ? 'none' : 'translateY(-4px)',
                  },
                }}
              >
                {isPopular && (
                  <Chip
                    icon={<StarIcon sx={{ fontSize: 16 }} />}
                    label="Popular"
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(25,118,210,0.15)' : 'rgba(25,118,210,0.08)',
                      color: 'primary.main',
                      fontWeight: 700,
                      '& .MuiChip-icon': { color: 'primary.main' },
                    }}
                  />
                )}

                <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column', pt: 3 }}>
                  {/* Plan Header */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: theme => theme.palette.mode === 'dark' ? theme.palette.grey[100] : '#0a1929' }}>
                      {plan.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ minHeight: 36 }}>
                      {plan.description}
                    </Typography>
                  </Box>

                  {/* Pricing */}
                  <Box sx={{ my: 1.5 }}>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: theme => theme.palette.mode === 'dark' ? theme.palette.grey[100] : '#0a1929' }}>
                      {formatPrice(price)}
                      {price > 0 && (
                        <Typography variant="body2" component="span" color="text.secondary" sx={{ ml: 1, fontWeight: 500 }}>
                          / {isYearly ? 'year' : 'month'}
                        </Typography>
                      )}
                    </Typography>
                    {isYearly && savings > 0 && price > 0 && (
                      <Typography variant="caption" color="primary.main" sx={{ display: 'block', mt: 0.75, fontWeight: 600 }}>
                        Save ${savings} vs monthly billing
                      </Typography>
                    )}
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Features */}
                  <List dense sx={{ my: 1.5, flexGrow: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Features include:</Typography>
                    {plan.features.map((feature, index) => (
                      <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 28 }}>
                          <CheckIcon sx={{ fontSize: 18, color: 'success.main' }} />
                        </ListItemIcon>
                        <ListItemText 
                          primary={feature} 
                          primaryTypographyProps={{ 
                            variant: 'body2', 
                            color: '#3e4c59'
                          }} 
                        />
                      </ListItem>
                    ))}
                  </List>

                  {/* Action Button */}
                  <Box sx={{ mt: 'auto' }}>
                    <Button
                      variant={isPopular ? 'contained' : 'outlined'}
                      fullWidth
                      disabled={isCurrentPlan || isLoading}
                      onClick={() => !isCurrentPlan && handleUpgrade(planType)}
                      sx={{
                        py: 1.1,
                        fontSize: '0.95rem',
                        fontWeight: 700,
                        textTransform: 'none',
                        borderRadius: 1.5,
                        boxShadow: isPopular ? '0 6px 16px 0 rgba(0, 118, 255, 0.22)' : 'none',
                        '&.Mui-disabled': {
                          backgroundColor: isCurrentPlan ? 'grey.50' : undefined,
                          borderColor: isCurrentPlan ? 'grey.300' : undefined,
                          color: isCurrentPlan ? 'text.secondary' : undefined,
                        }
                      }}
                    >
                      {isLoading && !isCurrentPlan ? (
                        <CircularProgress size={26} color="inherit" />
                      ) : isCurrentPlan ? (
                        'Your Current Plan'
                      ) : (
                        `Choose ${plan.name}`
                      )}
                    </Button>
                  </Box>
                </CardContent>
                {isCurrentPlan && (
                  <Chip 
                    label="Current Plan" 
                    size="small" 
                    sx={{ 
                      position: 'absolute',
                      bottom: 12,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(2,132,199,0.15)' : '#e0f2fe', 
                      color: '#0284c7',
                      fontWeight: 600,
                      fontSize: '11px',
                    }}
                  />
                )}
              </Card>
            );
          })}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default PlanSelectionModal;