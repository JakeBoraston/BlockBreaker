# Block Breaker

A classic block-breaker game built with **Svelte 5** and **TypeScript** as a hands-on learning project for game physics fundamentals and TypeScript.

## Project Purpose

This project was created as an **interactive learning experience** to understand core physics concepts in game development through **building**, not just reading. Instead of following tutorials, I learned by implementing each physics system from scratch, understanding the "why" behind every formula and algorithm.

### Learning Methodology

Rather than copying code, I explored each concept through guided questions:
- "How would you store multiple blocks?" → Understanding data structures
- "How do you detect circle-rectangle collision?" → Deriving the closest-point algorithm
- "What happens when velocity is applied each frame?" → Grasping kinematics
- "Why does the ball penetrate walls?" → Learning position correction

This hands-on approach led to deeper understanding of both **physics fundamentals** and **software architecture**.

## Physics Concepts Learned

### 1. Kinematics - Motion Fundamentals
- **Position, velocity, and acceleration** relationships
- Frame-based updates using Euler integration
- Gravity simulation with constant acceleration

```typescript
// Update velocity from acceleration
ball.velocity.x += ball.acceleration.x;
ball.velocity.y += ball.acceleration.y;

// Update position from velocity
ball.position.x += ball.velocity.x;
ball.position.y += ball.velocity.y;
```

### 2. Collision Detection - Finding Intersections

**Boundary Collision:**
```typescript
const hitMin = position - size <= min;
const hitMax = position + size >= max;
```

**Circle-Rectangle Collision (Closest Point Algorithm):**
```typescript
// Find closest point on rectangle to circle center
const closestX = Math.max(rect.x, Math.min(ball.x, rect.x + rect.width));
const closestY = Math.max(rect.y, Math.min(ball.y, rect.y + rect.height));

// Check if distance to closest point is less than radius
const distanceX = ball.x - closestX;
const distanceY = ball.y - closestY;
const distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);
const isColliding = distanceSquared < (ball.radius * ball.radius);
```

### 3. Collision Response - Reacting to Impacts

**Velocity Reflection with Energy Loss:**
```typescript
const newVelocity = -velocity * ball.restitution; // Reverse and apply restitution
```

**Position Correction (Preventing Penetration):**
```typescript
const correctedPosition = 2 * boundary - ballPos; // Mirror across boundary
```

**Determining Collision Axis:**
```typescript
// Which component is larger determines the collision side
if (Math.abs(distanceX) > Math.abs(distanceY)) {
  ball.velocity.x = -ball.velocity.x; // Hit left/right
} else {
  ball.velocity.y = -ball.velocity.y; // Hit top/bottom
}
```

### 4. Multiple Dynamic Objects - N-Body Simulation

**Managing Arrays of Game Entities:**
- Transitioning from single object to arrays
- Understanding `forEach` vs `map` vs `for...of`
- Nested loops for ball-block collision (O(n*m) complexity)

**Individual State Tracking:**
- Each ball maintains its own position, velocity, history, and `isLost` state
- Data locality principle - history stored with each ball object
- Conditional game over - only when ALL balls are lost

**Dynamic Object Spawning:**
```typescript
if (block.isSpecial) {
  balls.push({
    position: { x: block.position.x, y: block.position.y },
    velocity: { x: -ball.velocity.x, y: ball.velocity.y },
    // ... other properties
  });
}
```

### 5. Motion Trails - Position History

**Path Visualization:**
- Recording position history each frame
- Interpolating between positions for smooth trails
- Managing memory with fixed-size history buffers

```typescript
ball.history.push({ x: ball.position.x, y: ball.position.y });
if (ball.history.length > MAX_HISTORY) {
  ball.history.shift(); // Remove oldest
}
```

## Features

- **Smooth physics simulation** using requestAnimationFrame loop
- **Real-time collision detection** with proper position correction
- **Motion-based trail effects** following each ball's actual path
- **Particle system** for visual feedback on collisions
- **Space-themed visuals** with animated nebula clouds and twinkling stars
- **Multiple balls** - Special blocks spawn additional balls
- **Mobile support** - Touch events with gesture prevention
- **Type-safe codebase** with full TypeScript support
- **Modular architecture** - Organized physics, collision, and particle modules

## How the Game Works

### Game Loop

The core game loop runs via `requestAnimationFrame` (~60fps):

```typescript
function animate() {
  if (!gameOver && !gameWon) {
    update();  // Update physics and check collisions
  }
  draw();      // Render everything
  requestAnimationFrame(animate);
}
```

### Update Cycle

Each frame, the `update()` function:

1. **Updates physics** for each ball (apply acceleration → update velocity → update position)
2. **Records history** for motion trails
3. **Updates particles** (decay life, apply velocity)
4. **Checks collisions** in order:
   - Ball vs Blocks (nested loop checking all balls against all blocks)
   - Ball vs Paddle (with position correction)
   - Ball vs Boundaries (walls and bottom)
5. **Updates space background** (star twinkling, nebula drift)

### Collision Detection Order

The order matters for game feel:
1. **Blocks first** - So hitting a block doesn't also trigger paddle collision
2. **Paddle second** - Player interaction
3. **Boundaries last** - Fallback collision and game-over detection

### Ball Lifecycle

1. **Active** - Normal physics updates and collision checks
2. **Lost** - Falls off bottom, marked `isLost = true`, skipped in updates
3. **Removed** - When game resets, entire balls array is recreated

### Special Blocks

Randomized at initialization:
- 10% of blocks are "special" (configurable)
- When destroyed, spawn a new ball at block position
- New ball has opposite X velocity for spread effect

## Project Structure

```
src/
├── lib/
│   ├── types.ts          # TypeScript interfaces (Ball, Block, Particle, etc.)
│   ├── physics.ts        # Physics calculations (updatePhysics)
│   ├── collisions.ts     # Collision detection algorithms
│   ├── particles.ts      # Particle creation and updates
│   ├── constants.ts      # Game configuration constants
│   └── components/       # Svelte components (GameOver, GameWon)
└── routes/
    ├── +page.svelte      # Main game component
    └── +layout.js        # Prerender configuration
```

### Why This Structure?

- **Separation of concerns** - Physics logic separate from rendering
- **Testability** - Pure functions for collision/physics can be unit tested
- **Reusability** - Collision algorithms can be used in other projects
- **Type safety** - Centralized type definitions prevent errors
- **Performance** - Modular code allows easier optimization later

## Technologies

- **Svelte 5** - Modern reactive framework with runes ($state, $derived, $effect)
- **TypeScript** - Type safety and better developer experience
- **HTML Canvas** - 2D rendering with manual pixel control
- **Vite** - Fast development with HMR and optimized production builds
- **GitHub Pages** - Static site deployment with GitHub Actions

## Deep Learning Outcomes

Beyond just implementing features, I gained understanding of:

### Physics & Mathematics
1. **Euler integration** - Why frame-based physics works and its limitations
2. **Vector mathematics** - Position, velocity, acceleration as 2D vectors
3. **Collision geometry** - Closest-point algorithm derivation
4. **Restitution coefficient** - Energy loss in elastic/inelastic collisions
5. **Position correction** - Why naive collision response causes penetration

### Software Engineering
1. **Code organization** - When to extract modules vs keep code together
2. **Data structures** - Arrays vs objects, when to nest data
3. **Iteration patterns** - `forEach` for side effects, `map` for transformations
4. **Performance considerations** - O(n*m) nested loops, early returns
5. **State management** - Svelte 5 reactivity with $state runes
6. **Type-driven development** - Using TypeScript to prevent bugs

### Game Development
1. **Game loop architecture** - Update/draw separation
2. **Frame-independent motion** - Though simplified for learning
3. **Visual feedback** - Particles, screen shake, trails for game feel
4. **Input handling** - Mouse and touch events, preventing defaults
5. **Mobile considerations** - Touch events, viewport configuration, gesture blocking

### Debugging Skills
1. **Tracing state changes** - Using $inspect to watch reactive values
2. **Logic errors** - Finding `<=` vs `>=` bug in collision detection
3. **Scope issues** - Understanding function closure and reactivity
4. **Race conditions** - Viewport dimensions initializing before blocks

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
# Create production build for GitHub Pages
npm run build

# Preview production build locally
npm run preview
```

## How to Play

### Desktop
1. Move your mouse into the canvas area to start the game
2. Move the paddle by moving your mouse left/right
3. Keep the balls bouncing - don't let them fall!
4. Break all blocks to win
5. Special blocks (purple) spawn additional balls

### Mobile
1. Tap the canvas to start
2. Move your finger to control the paddle
3. Keep at least one ball in play
4. Same rules apply!

## Configuration

Game parameters can be adjusted in `src/lib/constants.ts`:

```typescript
export const GAME_CONFIG = {
  ball: {
    size: 5,                          // Ball radius
    initialVelocity: { x: 3, y: -3 }, // Starting speed
    restitution: 0.8                   // Energy retention (0-1)
  },
  block: {
    rows: 5,        // Number of block rows
    cols: 15,       // Number of block columns
    // ... etc
  }
}
```

Special block spawn rate (in `initialiseBlocks`):
```typescript
const isSpecialBlock = getRandomInt(100) < 10; // 10% chance
```

## Known Limitations & Future Work

### Current Simplifications
- **Fixed time step** - Assumes consistent 60fps (Euler integration)
- **No ball-to-ball collision** - Balls pass through each other
- **No spatial partitioning** - O(n*m) collision checks acceptable for small n,m
- **No delta time** - Physics tied to frame rate

### Potential Enhancements

**Physics:**
- **Ball-to-ball collision** - Circle-circle collision with momentum transfer
- **Friction** - Velocity damping and surface friction
- **Angular velocity** - Ball rotation based on movement
- **Momentum transfer** - Paddle velocity affecting ball direction
- **Verlet integration** - More stable physics simulation

**Game Features:**
- **Power-ups** - Speed boost, multi-ball, paddle size
- **Levels** - Progressive difficulty
- **Score system** - Points and combos
- **Lives** - Multiple chances before game over
- **Sound effects** - Audio feedback

**Technical:**
- **Delta time** - Frame-rate independent physics
- **Quadtree** - Spatial partitioning for performance
- **Object pooling** - Reuse particle objects
- **WebGL** - Hardware-accelerated rendering

## Deployment

Automatically deployed to GitHub Pages via GitHub Actions on every push to `main`:

The workflow:
1. Installs dependencies
2. Builds static site with SvelteKit adapter-static
3. Deploys to GitHub Pages

## License

This project is open source and available under the MIT License.

## Acknowledgments

Built as a **learning-first project** with guidance from Claude AI. Every feature was implemented through:
- Asking "why" before "how"
- Understanding the physics/math before coding
- Refactoring and debugging as learning opportunities
- Focusing on comprehension over completion

The goal wasn't to build the best block breaker game, but to deeply understand game physics fundamentals through hands-on implementation.

---

**This is a learning project.** The focus is on understanding physics concepts, algorithms, and software architecture - not on creating a polished game. If you're learning game development, I encourage you to build something similar from scratch rather than forking this repo. The learning happens in the building!
