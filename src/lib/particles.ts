import type { Particle, Vector2D } from "./types";

export function createParticles(
    position: Vector2D,
    color: string,
    count: number = 5
  ): Particle[] {
    const newParticles: Particle[] = [];

    for (let i = 0; i < count; i++) {
      newParticles.push({
        position: {
          x: position.x + (Math.random() - 0.5) * 4,
          y: position.y + (Math.random() - 0.5) * 4
        },
        velocity: {
          x: (Math.random() - 0.5) * 4,
          y: (Math.random() - 0.5) * 4
        },
        life: 2.0,
        decay: Math.random() * 0.05 + 0.01,
        size: Math.random() * 2 + 1,
        color: color
      });
    }
    return newParticles;
  }

  export function updateParticles(particles: Particle[]): Particle[] {
    return particles.filter(particle => {
      particle.position.x += particle.velocity.x;
      particle.position.y += particle.velocity.y;
      particle.life -= particle.decay;
      particle.velocity.x *= 0.99;
      particle.velocity.y *= 0.99;
      return particle.life > 0;
    });
  }
