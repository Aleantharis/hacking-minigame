import { Directions, Tile, RotatingTile, GoalTile, TrapTile, PowerTile, DifficultySettings, GameState, TileSerializer } from "./tiles.js"

export class PathGenerator {
    sizeX;
    sizeY;
    startX;
    startY;
    goalX;
    goalY;
    protoBoard;
    gameState;
    
    constructor(sizeX, sizeY, startX, startY, goalX, goalY) {
        this.sizeX = sizeX;
        this.sizeY = sizeY;
        this.startX = startX;
        this.startY = startY;
        this.goalX = goalX;
        this.goalY = goalY;

        this.protoBoard = Array.from(Array(sizeX), () => new Array(sizeY));

        // var powerTile = new PowerTile(this.#powX, this.#powY, this.gameState);
        // ///TODO: Change How goal is spawned in relation to power - also maybe spawn more than one goal (adapt gamestate victory checks)
        // var goalTile = new GoalTile(this.goalX, this.goalY, this.gameState);

        // this.protoBoard[startX][startY] = powerTile;
        // this.protoBoard[goalX][goalY] = goalTile;
    }
    
    
    generate() {
        var ret = [];

        if(this.#generateRec(this.startX, this.startY, -1, -1, ret)) {
            return ret;
        }

        throw new Error("No valid path found!");
    }

    #possibleDirections(curX, curY) {
        var ret = [];

        for (let i = 0; i < 4; i++) {
            var dir = Directions.getNeighborCoordinates(Directions.getByIndex(i), curX, curY);
            if(dir.X > 0 && dir.Y > 0 && dir.X < this.sizeX && dir.Y < this.sizeY && this.protoBoard[dir.X][dir.Y] === undefined){
                ret.push(dir);
            }
        }

        // return shuffled array of possible directions
        return ret.sort(() => Math.random() - 0.5);
    }

    #generateRec(curX, curY, prevX, prevY, path) {
        // add current position to path
        path.push({X:curX, Y:curY});
        this.protoBoard[curX][curY] = 'O';

        if(curX === this.goalX && curY === this.goalY) {
            return true;
        }

        var dirs = this.#possibleDirections(curX, curY);
        for (let i = 0; i < dirs.length; i++) {
            var dir = dirs[i];
            if(this.#generateRec(dir.X, dir.Y, curX, curY, path)) {
                return true;
            }
        }

        // if no walkable paths were discovered recursively, rollback current tile
        this.protoBoard[curX][curY] = undefined;
        path.pop();
        return false;
    }
}