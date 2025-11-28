export interface Vector2D {
    x: number,
    y: number
}

export interface Ball {
    position: Vector2D,
    velocity: Vector2D,
    acceleration: Vector2D,
    size: number,
    restitution: number
}

export interface Block {
    position: Vector2D,
    width: number,
    height: number,
    color: string;
    isSpecial: boolean,
    alive: boolean
}

export interface Particle {
    position: Vector2D,
    velocity: Vector2D,
    life: number,
    decay: number,
    size: number,
    color: string
}

export interface BoundaryCollision {
    hitMin: boolean,
    hitMax: boolean,
    minBoundary: number,
    maxBoundary: number
}

export interface Star {
    position: Vector2D,
    size: number,
    brightness: number,
    twinkleSpeed: number,
    twinklePhase: number,
    color: string,
    currentBrightness?: number
}

export interface NebulaCloud{
    position: Vector2D,
    size: number,
    opacity: number,
    drift: Vector2D,
    color: string
}