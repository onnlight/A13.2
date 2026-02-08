# Branch Protection Setup Guide

This repository requires branch protection on the main branch to ensure code quality and prevent direct pushes.

## Required Status Checks

The following status checks are required before merging to main:

1. **Test and Build**
   - All unit tests must pass
   - Production build must compile successfully
   - TypeScript compilation without errors
   - Support for Node.js 18.x and 20.x

2. **Code Quality Checks**
   - Type checking passes
   - No critical security vulnerabilities
   - No console errors or debug statements
   - File size checks within limits

## Branch Protection Rules

- **Required Approving Reviews**: 1
- **Dismiss Stale Reviews**: No
- **Require Review From Code Owners**: No
- **Require Updates To Branch**: Yes
- **Require Status Checks**: Yes
- **Require Branches To Be Up To Date**: Yes
- **Block Forced Pushes**: Yes
- **Block Deletions**: Yes
- **Require Administrators**: Yes

## Automated Setup

### Using GitHub CLI

1. **Install GitHub CLI**
   ```bash
   # On macOS
   brew install gh
   
   # On Windows
   winget install --id GitHub.cli
   
   # On Linux
   sudo apt install gh
   ```

2. **Authenticate**
   ```bash
   gh auth login
   ```

3. **Run setup script**
   ```bash
   chmod +x scripts/setup-branch-protection.sh
   ./scripts/setup-branch-protection.sh
   ```

## Manual Setup

### Step 1: Navigate to Settings

1. Go to repository on GitHub
2. Click "Settings" tab
3. Click "Branches" in left sidebar
4. Find "main" branch
5. Click "Edit" (pencil icon)

### Step 2: Configure Branch Protection

**Branch name**: `main`

#### Branch Protection Settings

1. **Protect matching branches**: ✅ Check this box
2. **Require a pull request before merging**: ✅ Check this box

   - **Require approvals**: ✅ Require 1 approving review
   - **Dismiss stale reviews**: ❌ Leave unchecked
   - **Require review from CODEOWNERS**: ❌ Leave unchecked

3. **Require status checks to pass before merging**: ✅ Check this box

   **Required status checks** (add these):
   - Test and Build
   - Code Quality Checks
   - branch-protection (optional)

4. **Require branches to be up to date before merging**: ✅ Check this box

5. **Do not allow bypassing**: ✅ Check this box
   - **Allow administrators**: ✅ Restrict administrators

6. **Restrict who can push**: ❌ Leave unchecked (no restrictions)

7. **Allow force pushes**: ❌ Leave unchecked
8. **Allow deletions**: ❌ Leave unchecked

### Step 3: Save Changes

Click "Create" or "Save changes" button.

## Verification

After setup, verify protection is active:

1. Navigate to repository "Settings" → "Branches"
2. Find "main" branch
3. You should see "Protected" badge
4. Click "View protection rules" to verify settings

## Pull Request Workflow

With branch protection enabled:

1. **Create a new branch** from main
   ```bash
   git checkout -b feat/your-feature
   ```

2. **Make changes and commit**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

3. **Push to remote**
   ```bash
   git push origin feat/your-feature
   ```

4. **Create Pull Request** on GitHub

5. **Automated checks run**:
   - Test and Build status check
   - Code Quality Checks status check
   - Branch Protection verification

6. **Request review** from a team member

7. **Address review feedback** if needed

8. **Merge** only when:
   - All status checks pass ✅
   - At least 1 approval ✅
   - Branch is up to date ✅

## Troubleshooting

### Push Rejected

If you try to push directly to main:
```
 ! [rejected] main -> main (non-fast-forward)
 error: failed to push some refs to 'https://github.com/onnlight/A13.2'
```

**Solution**: Create a feature branch and use a Pull Request instead.

### Status Checks Failing

If required checks fail:
1. Click on failed check
2. View error details
3. Fix issues locally
4. Push to your feature branch
5. Checks will re-run automatically

### Cannot Merge

Merge button disabled? Check:
- Are all required status checks passing?
- Is there at least 1 approving review?
- Is your branch up to date with main?
- Are you a repository admin with restrictions?

## Best Practices

### For Contributors

- Always create feature branches
- Keep PRs focused and small
- Write clear descriptions
- Address review feedback promptly
- Update branch if main changes

### For Reviewers

- Review PRs promptly
- Provide constructive feedback
- Test changes if possible
- Request changes when necessary
- Approve only when quality standards met

### For Maintainers

- Monitor CI/CD pipeline health
- Address flaky tests quickly
- Update protection rules as needed
- Educate team on workflow
- Enforce code quality standards

## Updating Protection Rules

To modify branch protection rules:

1. Navigate to "Settings" → "Branches"
2. Click "Edit" next to main branch
3. Update settings as needed
4. Click "Save changes"
5. Document changes in CHANGELOG.md

## Emergency Access

In case of emergencies requiring direct main access:

1. Temporarily disable branch protection
2. Make necessary changes
3. Re-enable protection immediately
4. Document emergency access

## Documentation

- **[CONTRIBUTING.md](CONTRIBUTING.md)**: Development workflow
- **[CHANGELOG.md](CHANGELOG.md)**: Version history
- **[README.md](README.md)**: Project overview

## Support

For questions or issues with branch protection:
- Create a discussion: https://github.com/onnlight/A13.2/discussions
- Open an issue: https://github.com/onnlight/A13.2/issues
- Review GitHub docs: https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/defining-the-mergeability-of-pull-requests/about-protected-branches
