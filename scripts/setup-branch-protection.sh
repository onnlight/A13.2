#!/bin/bash

# Branch Protection Setup Script
# Run this locally to configure branch protection on GitHub

echo "Setting up branch protection for main branch..."

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "Error: GitHub CLI (gh) is not installed"
    echo "Install it from: https://cli.github.com/"
    exit 1
fi

# Check if user is authenticated
if ! gh auth status &> /dev/null; then
    echo "Error: Not authenticated with GitHub CLI"
    echo "Run: gh auth login"
    exit 1
fi

REPO="onnlight/A13.2"
BRANCH="main"

echo "Configuring branch protection for $REPO branch: $BRANCH"

# Set up branch protection with required checks
gh api \
  --method PUT \
  -H "Accept: application/vnd.github+json" \
  repos/$REPO/branches/$BRANCH/protection \
  -f required_status_checks[0].context="Test and Build" \
  -f required_status_checks[0].strict=true \
  -f required_status_checks[0].contexts[]="Code Quality Checks" \
  -f enforce_admins=true \
  -f required_pull_request_reviews[0].approvals=1 \
  -f restrictions=null \
  -f enforce_admins=true \
  -f dismiss_stale_reviews=false \
  -f require_code_owner_reviews=false \
  -f required_approving_review_count=1 \
  -f allow_deletions=false \
  -f allow_force_pushes=false

echo "Branch protection configured successfully!"
echo ""
echo "Branch Protection Settings:"
echo "  - Required status checks: Test and Build, Code Quality Checks"
echo "  - Required approving reviews: 1"
echo "  - Enforce restrictions for admins: true"
echo "  - Dismiss stale reviews: false"
echo "  - Allow deletions: false"
echo "  - Allow force pushes: false"
echo ""
echo "Main branch is now protected. All changes must go through PRs."
