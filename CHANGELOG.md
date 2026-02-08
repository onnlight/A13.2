# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2025-02-08

### Added
- Initial project scaffolding with TypeScript, Vite, and Three.js
- Complete 3D endless runner game implementation
- Player movement system with left/right controls
- Obstacle spawning and collision detection
- Power-up system with speed, shield, and multiplier types
- Settings menu with audio controls and game preferences
- Leaderboard system with persistent storage
- Responsive UI improvements and mobile touch controls
- Storage utilities with validation and migration support
- Audio system with background music and sound effects
- Game state management (menu, playing, paused, gameover)
- Tutorial overlay and pause menu
- Multiple difficulty levels (easy, medium, hard)
- Multiple player skins (neon, classic, etc.)
- Theme switching based on score milestones

### Changed
- Refactored ObstacleManager to remove duplicate implementations
- Stabilized core APIs (AudioManager, Player, Game)
- Fixed TypeScript type errors in scene.ts and player.ts
- Improved collision detection with proper bounding box management
- Enhanced power-up collection logic

### Fixed
- Fixed runtime crash in power-up animation (undefined userData access)
- Removed duplicate method warnings in obstacles.ts
- Fixed material type compatibility with Three.js MeshPhongMaterial
- Corrected property initialization in constructors
- Aligned AudioManager API surface with main.ts usage

### Security
- Added .gitignore for sensitive and generated files
- Configured .gitattributes for proper line ending handling

### Documentation
- Created AGENTS.md with AI and tools documentation
- Created CHANGELOG.md with version history
- Created CONTRIBUTING.md with contribution guidelines
- Created README.md with project overview
- Added inline code documentation for core classes

### CI/CD
- Added GitHub Actions workflow for continuous integration
- Configured automated build and test execution on push
- Set up protected main branch with PR enforcement
- Added status checks for branch protection

## [0.1.0] - 2025-02-08 (Initial)

### Added
- Project initialization with package.json
- TypeScript configuration with strict mode
- Vite build configuration
- Jest test setup with jsdom environment
- Three.js integration for 3D graphics
- Basic game scene and player mesh
- Initial obstacle system
- Audio manager structure
- Storage utilities foundation
