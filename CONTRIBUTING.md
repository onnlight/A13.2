# Contributing to 3D Endless Runner

Thank you for your interest in contributing to this project! This document provides guidelines and instructions for contributing effectively.

## Code of Conduct

- Be respectful and inclusive
- Focus on what is best for the community
- Show empathy towards other community members

## Getting Started

### Prerequisites
- Node.js v18 or higher
- npm or yarn package manager
- Git for version control
- Modern web browser for testing

### Setup Development Environment

1. **Clone the repository**
   ```bash
   git clone https://github.com/onnlight/A13.2.git
   cd A13.2
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Run tests**
   ```bash
   npm test
   ```

## Development Workflow

### Branch Strategy

We use a Git-based workflow with these branch types:

- **main**: Production-ready code, protected
- **feat/**: New features
- **fix/**: Bug fixes
- **docs/**: Documentation changes
- **refactor/**: Code refactoring
- **test/**: Test additions or updates
- **chore/**: Maintenance tasks

### Creating a Branch

1. Update main branch
   ```bash
   git checkout main
   git pull origin main
   ```

2. Create feature branch
   ```bash
   git checkout -b feat/your-feature-name
   ```

### Making Changes

1. **Follow code style**
   - Use TypeScript for type safety
   - No comments unless specifically requested
   - Keep functions focused and small
   - Follow existing patterns in the codebase

2. **Write tests**
   - Unit tests for individual components
   - Integration tests for subsystems
   - Update tests when modifying existing code
   - Maintain test coverage above 80%

3. **Commit messages**
   - Use conventional commit format:
     ```
     feat: add new player skin option
     fix: resolve collision detection bug
     docs: update installation instructions
     refactor: simplify obstacle manager
     test: add player movement tests
     chore: update dependencies
     ```

4. **Build and test**
   ```bash
   npm run build
   npm test
   ```

### Pull Request Process

1. **Update your branch**
   ```bash
   git fetch origin
   git rebase origin/main
   ```

2. **Push to GitHub**
   ```bash
   git push origin feat/your-feature-name
   ```

3. **Create Pull Request**
   - Use clear, descriptive title
   - Reference related issues
   - Describe changes made
   - Link to any relevant documentation
   - Request reviews from maintainers

4. **Address feedback**
   - Respond to review comments promptly
   - Make requested changes
   - Push updates to your branch

## Code Standards

### TypeScript Guidelines

- **Strict mode enabled**: Follow TypeScript strict typing
- **No `any` types**: Use proper interfaces/types
- **Explicit returns**: Function return types should be explicit
- **Minimal comments**: Code should be self-documenting

### Three.js Best Practices

- **Dispose resources**: Always dispose geometries and materials
- **Reuse objects**: Pool where possible for performance
- **Batch operations**: Minimize draw calls
- **Shadow mapping**: Use appropriate shadow settings

### Testing Standards

- **Jest with jsdom**: Use configured test environment
- **Mock external deps**: Don't test third-party code
- **Test edge cases**: Boundary conditions and error states
- **Fast tests**: Each test should complete in < 100ms

## AI-Assisted Development

This project uses opencode AI agent for development assistance. When working with AI:

### AI Workflow Integration
1. **Analysis Phase**: Let AI explore codebase using glob/grep
2. **Implementation Phase**: AI uses write/edit for code changes
3. **Verification Phase**: Run `npm run build` and `npm test`
4. **Git Integration**: Create commits and manage branches

### AI Communication Patterns
- **Be specific**: Describe exact requirements
- **Provide context**: Share relevant files and constraints
- **Ask for verification**: Request build/test runs
- **Review changes**: Always review AI-generated code

### AI Tool Usage
- **File operations**: read, write, edit, glob, grep
- **Execution**: bash for build/test commands
- **Integration**: Git operations and web search
- **Documentation**: Automatic doc generation

## Project Structure

```
├── src/
│   ├── main.ts          # Main game entry point
│   ├── scene.ts         # Three.js scene management
│   ├── player.ts        # Player controls and physics
│   ├── obstacles.ts     # Obstacle and power-up system
│   ├── audio.ts         # Audio manager
│   └── storage.ts       # LocalStorage utilities
├── tests/
│   ├── setup.ts         # Test configuration
│   ├── *.test.ts       # Test files
│   └── mocks/          # Test utilities
├── index.html          # Main HTML file
├── package.json        # Dependencies and scripts
├── tsconfig.json      # TypeScript configuration
├── vite.config.ts     # Vite build configuration
└── jest.config.js     # Jest test configuration
```

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Writing Tests

- Use Jest framework with jsdom environment
- Mock Three.js and AudioContext
- Test both happy path and error cases
- Keep tests independent and isolated

## Build and Deploy

### Local Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Continuous Integration

- All PRs must pass CI checks
- Automated build runs on every push
- Test suite must pass completely
- TypeScript compilation must succeed

## Reporting Issues

### Bug Reports

- Use GitHub issue tracker
- Provide clear reproduction steps
- Include error messages and screenshots
- Specify browser/OS version
- Attach relevant code snippets

### Feature Requests

- Describe the desired functionality
- Explain the use case
- Suggest implementation approach
- Consider existing patterns

## Questions and Support

- Check documentation first (README.md, AGENTS.md)
- Search existing issues
- Create new issue with relevant labels
- Join community discussions

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

## Recognition

Contributors will be acknowledged in:
- README.md contributors section
- CHANGELOG.md for significant changes
- Release notes for new features

Thank you for contributing!
