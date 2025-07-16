#!/bin/bash

# Simple validation script for GitHub Actions workflow
echo "🔍 Validating GitHub Actions workflow..."

# Check if workflow file exists
if [ ! -f ".github/workflows/main.yml" ]; then
    echo "❌ Workflow file not found"
    exit 1
fi

# Basic YAML syntax validation (requires yamllint if available)
if command -v yamllint &> /dev/null; then
    echo "📝 Running YAML syntax check..."
    yamllint .github/workflows/main.yml
    if [ $? -eq 0 ]; then
        echo "✅ YAML syntax is valid"
    else
        echo "❌ YAML syntax errors found"
        exit 1
    fi
else
    echo "⚠️  yamllint not available, skipping YAML validation"
fi

# Check for required keys
echo "🔍 Checking workflow structure..."

if grep -q "name:" .github/workflows/main.yml; then
    echo "✅ Workflow name defined"
else
    echo "❌ Missing workflow name"
    exit 1
fi

if grep -q "on:" .github/workflows/main.yml; then
    echo "✅ Trigger events defined"
else
    echo "❌ Missing trigger events"
    exit 1
fi

if grep -q "jobs:" .github/workflows/main.yml; then
    echo "✅ Jobs defined"
else
    echo "❌ Missing jobs"
    exit 1
fi

echo "✅ GitHub Actions workflow validation completed successfully!"
