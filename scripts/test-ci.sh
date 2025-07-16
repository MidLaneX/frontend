#!/bin/bash

# Comprehensive CI/CD Pipeline Test Script
echo "🚀 Testing CI/CD Pipeline Components"
echo "===================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test results
TESTS_PASSED=0
TESTS_FAILED=0

run_test() {
    local test_name="$1"
    local test_command="$2"
    
    echo -e "\n🧪 Testing: $test_name"
    echo "Command: $test_command"
    
    if eval "$test_command" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ PASS${NC}: $test_name"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "${RED}❌ FAIL${NC}: $test_name"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
}

# Required files check
echo -e "\n📁 Checking required files..."
run_test "pnpm-lock.yaml exists" "test -f pnpm-lock.yaml"
run_test "package.json exists" "test -f package.json"
run_test "tsconfig.json exists" "test -f tsconfig.json"
run_test "GitHub workflow exists" "test -f .github/workflows/main.yml"

# pnpm commands check
echo -e "\n📦 Testing pnpm commands..."
run_test "pnpm install" "pnpm install --frozen-lockfile"
run_test "TypeScript type check" "pnpm run type-check"
run_test "ESLint linting" "pnpm run lint"
run_test "Production build" "pnpm run build"

# Build artifacts check
echo -e "\n🏗️ Checking build artifacts..."
run_test "dist directory exists" "test -d dist"
run_test "index.html exists" "test -f dist/index.html"
run_test "JavaScript bundle exists" "ls dist/assets/index-*.js > /dev/null 2>&1"

# Enhanced scripts check
echo -e "\n🔧 Testing enhanced scripts..."
run_test "validate script" "pnpm run validate"
run_test "lint:ci script" "pnpm run lint:ci"

# Workflow syntax check
echo -e "\n📝 Workflow validation..."
if command -v yamllint &> /dev/null; then
    run_test "YAML syntax validation" "yamllint .github/workflows/main.yml"
else
    echo -e "${YELLOW}⚠️ SKIP${NC}: yamllint not available"
fi

# Summary
echo -e "\n📊 Test Summary"
echo "==============="
echo -e "Tests passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests failed: ${RED}$TESTS_FAILED${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "\n${GREEN}🎉 All tests passed! CI/CD pipeline is ready.${NC}"
    exit 0
else
    echo -e "\n${RED}💥 Some tests failed. Please fix the issues before deploying.${NC}"
    exit 1
fi
