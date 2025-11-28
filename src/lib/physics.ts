import type { Ball } from "./types";

export function updatePhysics(ball: Ball): void {
    ball.velocity.x += ball.acceleration.x;
    ball.velocity.y += ball.acceleration.y;
    ball.position.x += ball.velocity.x
    ball.position.y += ball.velocity.y
}