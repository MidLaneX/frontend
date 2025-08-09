import scrumFeatures from "../featureMap/scrum";
import kanbanFeatures from "../featureMap/kanban";
import waterfallFeatures from "../featureMap/waterfall";

export const templateFeatureRegistry = {
  scrum: scrumFeatures,
  kanban: kanbanFeatures,
  waterfall: waterfallFeatures,
};

// Types for better TypeScript support
export type TemplateType = keyof typeof templateFeatureRegistry;
export type FeatureName = keyof typeof scrumFeatures;

// Helper functions
export const getTemplateFeatures = (template: TemplateType) => {
  return templateFeatureRegistry[template] || {};
};

export const getFeatureComponent = (template: TemplateType, feature: string) => {
  const features = templateFeatureRegistry[template] as Record<string, any>;
  return features?.[feature] || null;
};

export const getAvailableFeatures = (template: TemplateType) => {
  const features = templateFeatureRegistry[template];
  return features ? Object.keys(features) : [];
};
