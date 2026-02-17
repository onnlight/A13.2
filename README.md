# 3D Endless Runner

A modern, feature-rich 3D endless runner game built with TypeScript, Three.js, and Vite.

![Game Preview](https://via.placeholder.com/800x400?text=3D+Endless+Runner)

## Features

- **3D Graphics**: Built with Three.js for immersive gameplay
- **Responsive Design**: Works on desktop and mobile devices
- **Multiple Difficulty Levels**: Easy, Medium, Hard with adjustable speed
- **Customizable Skins**: Choose from various player skins with shop system
- **Coin Collection**: Collect golden coins to earn currency
- **Skin Shop**: Purchase new skins using collected coins
- **Enhanced Power-Up System**: 
  - Speed boost (3s, 1.5x speed)
  - Shield protection (5s, invincibility)
  - Score multiplier (10s, 2x score)
  - Magnet power-up (8s, auto-collect nearby coins)
  - Slow-motion (6s, 50% speed reduction)
- **Persistent Storage**: Save settings, coins, and leaderboard progress locally
- **Audio System**: Background music and sound effects with volume controls
- **Touch Controls**: Mobile-friendly swipe gestures
- **Keyboard Controls**: Arrow keys or WASD for movement
- **Leaderboard**: Track and display high scores with statistics

## Getting Started

### Prerequisites

- Node.js v18 or higher
- npm or yarn package manager
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

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

4. **Open in browser**
   - Navigate to `http://localhost:3000`
   - Or use the Vite dev server port shown in terminal

## Game Controls

### Desktop
- **Left Arrow / A**: Move left
- **Right Arrow / D**: Move right
- **P / ESC**: Pause game
- **H**: Return to main menu
- **R**: Restart game
- **T**: Show tutorial
- **S**: Open shop
- **O**: Open settings

### Mobile
- **Swipe Left**: Move left
- **Swipe Right**: Move right
- **On-screen buttons**: Left/Right movement, Pause

## Game Mechanics

### Obstacles
- Three types: Cube, Cylinder, Pyramid
- Spawn rate increases with difficulty
- Random lane positioning
- Glowing visual effects

### Power-Ups
- **Speed**: Temporary speed boost (yellow sphere, 3s duration)
- **Shield**: Temporary invincibility (cyan icosahedron, 5s duration)
- **Multiplier**: 2x score boost (purple torus, 10s duration)
- **Magnet**: Auto-collect nearby coins (pink octahedron, 8s duration)
- **Slow-motion**: Reduce game speed by 50% (blue tetrahedron, 6s duration)

### Coins & Shop System
- **Golden Coins**: Collectible currency worth 10 coins each
- **Coin Spawning**: 30% chance per obstacle spawn, 1-3 coins per spawn
- **Shop Interface**: Purchase new player skins with collected coins
- **Skin Prices**: 
  - Neon: Free (default)
  - Fire: 100 coins
  - Ice: 150 coins
  - Rainbow: 200 coins
  - Shadow: 400 coins (premium)
  - Gold: 500 coins (premium)
  - Crystal: 600 coins (premium)
- **Persistent Balance**: Coins saved between game sessions

### Scoring
- Points awarded based on game speed
- Multiplier power-ups double score gain
- High scores saved to leaderboard

### Difficulty Levels
- **Easy**: Slower speed, more power-ups
- **Medium**: Balanced gameplay
- **Hard**: Fast speed, fewer power-ups

## Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate test coverage
npm run test:coverage
```

### Project Structure

```
├── src/
│   ├── main.ts          # Main game entry point and loop
│   ├── scene.ts         # Three.js scene management
│   ├── player.ts        # Player controls and physics
│   ├── obstacles.ts     # Obstacle and power-up system
│   ├── coins.ts         # Coin collection and management
│   ├── shop.ts          # Shop UI and skin purchasing
│   ├── audio.ts         # Audio manager and sound effects
│   └── storage.ts       # LocalStorage utilities
├── tests/
│   ├── setup.ts         # Test configuration
│   └── *.test.ts       # Unit and integration tests
├── index.html          # Main HTML file
├── package.json        # Dependencies and scripts
├── tsconfig.json      # TypeScript configuration
└── vite.config.ts     # Vite build configuration
```

### Technology Stack

- **Language**: TypeScript 5.2.2
- **Build Tool**: Vite 5.4.21
- **3D Engine**: Three.js 0.159.0
- **Testing**: Jest 30.2.0 with jsdom
- **E2E Testing**: Puppeteer 24.35.0
- **Development**: ESLint, Prettier (recommended)

## Contributing

We welcome contributions! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on:
- Code of conduct
- Development workflow
- Code standards
- Pull request process
- Testing requirements

### Quick Start for Contributors

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/amazing-feature`)
3. Commit changes (`git commit -m 'feat: add amazing feature'`)
4. Push to branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

## Documentation

- **[AGENTS.md](AGENTS.md)**: AI agent and tools documentation
- **[CHANGELOG.md](CHANGELOG.md)**: Version history and changes
- **[CONTRIBUTING.md](CONTRIBUTING.md)**: Contribution guidelines

## Testing

### Running Tests

```bash
# All tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

### Test Coverage

- Unit tests for individual components
- Integration tests for game systems
- E2E tests for complete gameplay flows
- Mock implementations for external dependencies

## Continuous Integration

This project uses GitHub Actions for CI/CD:
- Automated testing on every push
- Build verification
- Code quality checks
- Protected main branch with PR enforcement

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance

- Optimized Three.js rendering
- Efficient collision detection
- 60 FPS target on modern devices
- Memory-efficient object pooling
- Minimal garbage collection impact

## Recent Updates (v1.2)

### New Features Added:
- **Coin Collection System**: Golden coins spawn on track for collection
- **Skin Shop System**: Purchase new player skins with collected coins
- **2 New Power-Ups**: Magnet (auto-collect coins) and Slow-motion (reduce game speed)
- **3 Premium Skins**: Gold, Shadow, and Crystal skins with unique visual effects
- **Enhanced Audio**: New coin collection and shop interaction sounds
- **Improved UI**: Coin balance display and shop interface

### Technical Improvements:
- Enhanced storage system for coin persistence
- Improved collision detection for collectibles
- Better power-up management with duration indicators
- Expanded test coverage for new systems
- Updated tutorial and documentation

### Gameplay Balance:
- Coin spawn rate: 30% chance per obstacle
- Coin value: 10 coins per collectible
- Power-up durations balanced for fair gameplay
- Skin prices provide progression goals
- Minimal garbage collection
- Smooth 60 FPS gameplay
- Responsive design adapts to device

## License

This project is licensed under the MIT License - see LICENSE file for details.

## Acknowledgments

- Three.js community for 3D graphics resources
- Vite team for excellent build tooling
- Jest community for testing framework
- Open source contributors

## Roadmap

### Planned Features
- [ ] Multiplayer support
- [ ] Additional power-up types
- [ ] Level progression system
- [ ] Character customization
- [ ] Soundtrack selection
- [ ] Achievement system
- [ ] Cloud save integration

### Known Issues
- Check [GitHub Issues](https://github.com/onnlight/A13.2/issues) for current bugs and feature requests

## Support

- **Documentation**: [AGENTS.md](AGENTS.md), [CONTRIBUTING.md](CONTRIBUTING.md)
- **Issues**: [GitHub Issue Tracker](https://github.com/onnlight/A13.2/issues)
- **Discussions**: [GitHub Discussions](https://github.com/onnlight/A13.2/discussions)

## Version

Current version: 1.0.0
See [CHANGELOG.md](CHANGELOG.md) for version history.

---

Made with ❤️ using [opencode](https://opencode.ai) AI agent
