# Block Breaker

A modern block-breaker game built with **Svelte 5** and **TypeScript** as a hands-on learning project for game physics fundamentals.

## Project Purpose

This project was created as an interactive learning experience to understand core **physics concepts** in game development, including:

- **Kinematics** - Position, velocity, and acceleration
- **Collision detection** - Circle-rectangle and boundary collision algorithms
- **Collision response** - Position correction and velocity reflection
- **Restitution** - Energy loss in collisions
- **Motion trails** - Position history rendering

## Features

- **Smooth physics simulation** using requestAnimationFrame
- **Real-time collision detection** with proper position correction
- **Motion-based trail effects** following the ball's actual path
- **Particle system** for visual feedback
- **Space-themed visuals** with animated nebula clouds and twinkling stars
- **Type-safe codebase** with full TypeScript support
- **Modular architecture** - Organized into reusable modules

## Project Structure

```
src/
├── lib/
│   ├── types.ts          # TypeScript type definitions
│   ├── physics.ts        # Physics calculations
│   ├── collisions.ts     # Collision detection algorithms
│   ├── particles.ts      # Particle system
│   ├── constants.ts      # Game configuration
│   └── components/       # Svelte components (GameOver, GameWon)
└── routes/
    └── +page.svelte      # Main game component
```

## Technologies

- **Svelte 5** - Modern reactive framework with runes ($state, $derived, $effect)
- **TypeScript** - Type safety throughout
- **HTML Canvas** - 2D rendering
- **Vite** - Fast development and build tooling

## Learning Outcomes

Through building this project, I learned:

1. **Physics fundamentals** - How to simulate realistic ball movement with gravity and collisions
2. **Collision algorithms** - Implementing circle-rectangle collision using the closest-point method
3. **Position correction** - Preventing objects from penetrating boundaries
4. **Code organization** - Structuring a game with separation of concerns
5. **Type safety** - Leveraging TypeScript for robust game state management
6. **Canvas rendering** - Drawing and animating graphics efficiently

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm, pnpm, or yarn

### Installation

```sh
# Clone the repository
git clone https://github.com/yourusername/BlockBreaker.git
cd BlockBreaker

# Install dependencies
npm install
```

### Development

```sh
# Start development server
npm run dev

# Open in browser
npm run dev -- --open
```

### Building

```sh
# Create production build
npm run build

# Preview production build
npm run preview
```

## How to Play

1. Move your mouse into the canvas to start
2. Keep the ball bouncing by moving the paddle
3. Break all the blocks to win
4. Don't let the ball fall off the bottom!

## Key Physics Concepts Implemented

### Velocity and Position Updates
```typescript
ball.velocity.x += ball.acceleration.x;
ball.velocity.y += ball.acceleration.y;
ball.position.x += ball.velocity.x;
ball.position.y += ball.velocity.y;
```

### Collision Response with Restitution
```typescript
const newVelocity = -velocity * ball.restitution;
const correctedPosition = 2 * boundary - ballPos;
```

### Circle-Rectangle Collision Detection
```typescript
const closestX = Math.max(rect.x, Math.min(ball.x, rect.x + rect.width));
const closestY = Math.max(rect.y, Math.min(ball.y, rect.y + rect.height));
const distance = Math.sqrt((ball.x - closestX)² + (ball.y - closestY)²);
return distance < ball.radius;
```

## Future Enhancements

Potential physics concepts to explore:

- **Multiple balls** - N-body simulation with ball-to-ball collisions
- **Power-ups** - Impulse forces and speed modifiers
- **Friction** - Velocity damping and drag
- **Angular velocity** - Ball rotation based on movement
- **Momentum transfer** - Paddle movement affecting ball direction

## License

This project is open source and available under the MIT License.

## Acknowledgments

Built as a learning project with guidance from Claude AI, focusing on understanding physics fundamentals through practical implementation.

---

**Note:** This is a learning project created to explore game physics concepts. The focus is on understanding the underlying mathematics and algorithms rather than creating a production game.
