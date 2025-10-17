// ESLint Configuration Override for Vercel Deployment
// This file provides a more lenient configuration for production builds

module.exports = {
  rules: {
    // Allow 'any' types (downgrade to warning for deployment)
    '@typescript-eslint/no-explicit-any': 'warn',
    
    // Allow unused vars with _ prefix
    '@typescript-eslint/no-unused-vars': ['error', {
      'argsIgnorePattern': '^_',
      'varsIgnorePattern': '^_',
      'caughtErrorsIgnorePattern': '^_'
    }],
    
    // Allow useless catch (for now)
    'no-useless-catch': 'warn',
    
    // Allow case declarations
    'no-case-declarations': 'warn',
    
    // Make exhaustive-deps a warning instead of error
    'react-hooks/exhaustive-deps': 'warn',
    
    // Make rules-of-hooks an error (this is critical)
    'react-hooks/rules-of-hooks': 'error',
    
    // Allow fast refresh issues as warning
    'react-refresh/only-export-components': 'warn'
  }
};
