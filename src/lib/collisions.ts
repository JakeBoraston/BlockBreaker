import type { BoundaryCollision, Vector2D, Ball } from "./types";

export function checkBoundaryCollision(
    position: number,
    size: number,
    min: number,
    max: number
): BoundaryCollision {
    return {
        hitMin: position - size <= min,
        hitMax: position + size >= max,
        minBoundary: min + size,
        maxBoundary: max - size
    }
}

export function checkCircleRectCollision(
    ball: Ball,
    rect: {
        position: Vector2D; width: number; height:
            number
    }
): {
    isColliding: boolean;
    closestX: number;
    closestY: number;
    distanceX: number;
    distanceY: number;
} {
    const closestX = Math.max(
        rect.position.x,
        Math.min(ball.position.x, rect.position.x + rect.width)
    );
    const closestY = Math.max(
        rect.position.y,
        Math.min(ball.position.y, rect.position.y + rect.height)
    );

    const distanceX = ball.position.x - closestX;
    const distanceY = ball.position.y - closestY;
    const distanceSquared = distanceX * distanceX + distanceY *
        distanceY;

    return {
        isColliding: distanceSquared < ball.size * ball.size,
        closestX,
        closestY,
        distanceX,
        distanceY
    };
}
