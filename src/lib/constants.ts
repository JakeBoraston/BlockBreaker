import type { Vector2D } from "./types"

export interface GameConfig {
    ball: {
        size: number,
        restitution: number;
    },
    paddle: {
        width: number,
        height: number,
        bottomOffset: number;
    };
    block: {
        height: number,
        width: number,
        padding: number,
        rows: number,
        cols: number,
        rowOffset: number
    }
}

export const GAME_CONFIG: GameConfig = {
    ball: {
        size: 5,
        restitution: 0.8
    },
    paddle: {
        width: 100,
        height: 5,
        bottomOffset: 15
    },
    block: {
        height: 10,
        width: 20,
        padding: 15,
        rows: 10,
        cols: 10,
        rowOffset: 5
    }
}
