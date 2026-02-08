# Agents and AI Tools Documentation

## AI Agent Information

### Primary AI Agent
- **Agent Name**: opencode
- **Model ID**: opencode/glm-4.7-free
- **Purpose**: Interactive CLI tool for software engineering tasks
- **Capabilities**:
  - Code analysis and refactoring
  - File system operations (read, write, edit, glob, grep)
  - Build and test execution
  - Git operations
  - Web search and code search
  - Task management and documentation

### Tooling and Frameworks

#### Core Development Tools
- **Package Manager**: npm (Node Package Manager)
- **Build Tool**: Vite v5.4.21
- **Language**: TypeScript v5.2.2
- **Test Runner**: Jest v30.2.0
- **Test Environment**: jsdom v27.4.0

#### 3D Graphics
- **Library**: Three.js v0.159.0
- **Type Definitions**: @types/three v0.182.0

#### Development Dependencies
- **Type Checking**: TypeScript
- **Testing**: jest, jest-environment-jsdom, ts-jest
- **E2E Testing**: Puppeteer v24.35.0
- **Type Definitions**: @types/jest v30.0.0, @types/puppeteer v5.4.7

## AI Development Workflow

### Typical Workflow
1. **Analysis Phase**
   - Codebase exploration using glob, grep, and read tools
   - Understanding existing patterns and conventions
   - Identifying areas for improvement

2. **Implementation Phase**
   - Writing and editing code using write/edit tools
   - Applying patches for targeted changes
   - Ensuring TypeScript compliance

3. **Verification Phase**
   - Running build process: `npm run build`
   - Executing tests: `npm test`
   - Type checking and linting

4. **Git Integration**
   - Creating commits with descriptive messages
   - Managing branches and PRs
   - Handling merge conflicts

## Project-Specific AI Capabilities

### Code Pattern Recognition
- Identifies duplicate code and suggests refactoring
- Detects anti-patterns in TypeScript
- Recommends Three.js best practices
- Optimizes performance bottlenecks

### Automated Refactoring
- Removes duplicate method implementations
- Standardizes API surfaces
- Improves type safety
- Enhances code readability

### Testing Support
- Generates test cases for new features
- Creates mock implementations for external dependencies
- Validates test coverage
- Identifies flaky tests

## Communication Patterns

### User Interaction
- **Response Style**: Concise, direct, minimal fluff
- **Code Style**: No comments unless requested
- **Verbosity**: Fewer than 4 lines unless detailed explanation requested
- **Proactiveness**: Balanced - helpful but not surprising

### Error Handling
- Graceful degradation when tools fail
- Clear error messages for user feedback
- Fallback strategies for common issues
- Recovery procedures for failed operations

## Tool Capabilities Reference

### File Operations
- **read**: Read file contents with optional offset/limit
- **write**: Write new files (overwrites existing)
- **edit**: Exact string replacements in files
- **glob**: Fast file pattern matching
- **grep**: Content search with regex support

### Execution Tools
- **bash**: Execute shell commands with timeout
- **question**: Ask user questions during execution
- **todowrite**: Manage task lists

### External Integration
- **webfetch**: Fetch web content (markdown, text, HTML)
- **websearch**: Real-time web search with live crawling
- **codesearch**: Programming-specific code search with examples
- **task**: Launch specialized subagents (general, explore)

## Best Practices

### Code Quality
- Follow existing code conventions
- Use TypeScript strict mode
- Implement proper error handling
- Ensure resource cleanup (dispose patterns)

### Git Workflow
- Use descriptive commit messages
- Create feature branches
- Implement PR-based development
- Maintain clean history

### Testing Strategy
- Unit tests for individual components
- Integration tests for subsystems
- E2E tests for complete workflows
- Mock external dependencies appropriately

## Environment Configuration

### Current Setup
- **Platform**: Windows (win32)
- **Working Directory**: E:\proj\3.2
- **Git Repository**: Initialized with protected main branch
- **Remote**: https://github.com/onnlight/A13.2

### Build Configuration
- **TypeScript**: tsconfig.json with strict mode
- **Vite**: Vite configuration for bundling
- **Jest**: Jest configuration with jsdom environment
- **Git**: .gitattributes and .gitignore configured

## Continuous Improvement

### Agent Capabilities Expansion
- Learning from project patterns
- Adapting to team conventions
- Improving error recovery
- Enhancing automation

### Tool Integration
- Seamless Git operations
- Automated testing workflows
- CI/CD pipeline support
- Documentation generation
