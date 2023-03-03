// https://dev.to/nehal_mahida/oops-in-javascript-with-easy-to-understand-examples-2ppn
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Static_initialization_blocks
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/static
// https://stackoverflow.com/questions/950087/how-do-i-include-a-javascript-file-in-another-javascript-file
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import

import { Directions, Tile, RotatingTile, GoalTile, TrapTile, PowerTile, DifficultySettings, GameState, TileSerializer } from "./tiles.js"

export class GameLogic {
    static difficultyValues = {
        0: new DifficultySettings(0.35, 0),
        1: new DifficultySettings(0.50, 0.1),
        2: new DifficultySettings(0.60, 0.2)
    }

    circuitBoard;
    gameState;
    gameOverTrigger;

    #powX = -1;
    #powY = -1;

    constructor(difficulty, sizeX, sizeY, gameOverTrigger, DEBUG) {
        this.gameState = new GameState(difficulty, sizeX, sizeY, -1, -1, DEBUG);
        this.gameOverTrigger = gameOverTrigger;

        this.#createBoard(difficulty, sizeX, sizeY);

        // if(!DEBUG) {
        //     while ((!CircuitBoardVerifier.verify(this.circuitBoard, this.#powX, this.#powY))) {
        //         this.#createBoard(difficulty, sizeX, sizeY);
        //     }
        // }

        // since this copy shit obviously doesnt want o fucking work, 
        // try a different approach, generating a path from power->goal first, then fill up rest of tiles (still not allowing traps near 4-edge tiles),
        // then spin all rotatingtiles 1-3 times randomly

        // i do not understand why in the name of cthulhu, we still have references back to the original object.....
        // like seriousyl i create new objects for everything, new arrays, etc.
        // and still the original grid gets rotated around during verification

        this.gameState.boardPowered = false;
        this.gameState.goalPowered = false;
        this.gameState.trapPowered = false;
    }

    #createBoard(difficulty, sizeX, sizeY) {
        // init game board
        this.circuitBoard = Array.from(Array(sizeX), () => new Array(sizeY));

        // generate goal & power tile
        switch (Math.floor(Math.random() * 4)) {
            case 0: // Top Edge
                this.#powX = 0;
                this.#powY = Math.floor(Math.random() * sizeY);
                break;
            case 1: // Right Edge
                this.#powX = Math.floor(Math.random() * sizeX);
                this.#powY = sizeY - 1;
                break;
            case 2: // Bottom Edge
                this.#powX = sizeX - 1;
                this.#powY = Math.floor(Math.random() * sizeY);
                break;
            case 3: // Left Edge
                this.#powX = Math.floor(Math.random() * sizeX);
                this.#powY = 0;
                break;
        }

        var powerTile = new PowerTile(this.#powX, this.#powY, this.gameState);
        ///TODO: Change How goal is spawned in relation to power - also maybe spawn more than one goal (adapt gamestate victory checks)
        var goalTile = new GoalTile(sizeX - this.#powX - 1, sizeY - this.#powY - 1, this.gameState);

        this.gameState.powX = this.#powX;
        this.gameState.powY = this.#powY;

        this.circuitBoard[this.#powX][this.#powY] = powerTile;
        this.circuitBoard[goalTile.X][goalTile.Y] = goalTile;

        var maxFixedTiles = Math.round(sizeX * sizeY * GameLogic.difficultyValues[difficulty].fixedTilePercentage);

        // Init Rest of tiles
        for (let i = 0; i < sizeX; i++) {
            for (let j = 0; j < sizeY; j++) {
                if (this.circuitBoard[i][j] === undefined) {
                    var temp;

                    // generate fixed tile if rng allows for it
                    if (maxFixedTiles-- > 0 && Math.random() <= GameLogic.difficultyValues[difficulty].fixedTilePercentage) {
                        temp = new Tile(i, j, this.gameState);
                    }
                    else {
                        temp = new RotatingTile(i, j, this.gameState);
                    }

                    // Add random amount of open edges to tile
                    // bias the randomness - 1/6 2/6 3/6 - maybe factor in difficulty
                    var ran = Math.floor(Math.random() * 100);
                    // i am too stupid to create a mathematical formula for this
                    var edgeAmnt = (ran < 70 ? 0 : ran < 90 ? 1 : 2) + 2;
                    for (let k = 0; k < edgeAmnt; k++) {
                        temp.OpenEdges.push(Directions.getRandomMissingDirection(temp.OpenEdges));
                    }

                    this.circuitBoard[i][j] = temp;
                }
            }
        }

        // Create tile links - has to be done seperately otherwise array would not be filled
        for (let i = 0; i < sizeX; i++) {
            for (let j = 0; j < sizeY; j++) {
                for (let k = 0; k < 4; k++) {
                    var dir = Directions.getByIndex(k);
                    var n = this.circuitBoard[i][j].getNeighborCoordinates(dir);

                    if (n.X >= 0 && n.X < sizeX && n.Y >= 0 && n.Y < sizeY) {
                        this.circuitBoard[i][j].Neighbors.set(dir, this.circuitBoard[n.X][n.Y]);
                    }
                }
            }
        }

        // Init trap tiles after links are made to make sanity checks easier
        var possibleTrapCoords = [];
        for (let i = 0; i < sizeX; i++) {
            for (let j = 0; j < sizeY; j++) {
                if (!(this.circuitBoard[i][j] instanceof GoalTile) &&
                    !(this.circuitBoard[i][j] instanceof PowerTile) &&
                    Array.from(this.circuitBoard[i][j].Neighbors.values()).filter((n) => n !== null && n.OpenEdges.length > 3).length === 0) {
                    possibleTrapCoords.push({ X: i, Y: j });
                }
            }
        }

        var maxTrapTiles = Math.min(Math.floor(sizeX * sizeY * GameLogic.difficultyValues[difficulty].trapTileAmount), possibleTrapCoords.length);
        for (; maxTrapTiles > 0; maxTrapTiles--) {
            var tr = possibleTrapCoords.splice(Math.floor(Math.random() * possibleTrapCoords.length), 1)[0];
            this.circuitBoard[tr.X][tr.Y] = new TrapTile(this.circuitBoard[tr.X][tr.Y]);
        }
    }

    boardInteraction(x, y) {
        this.circuitBoard[x][y].clickTrigger();

        if (this.gameState.trapPowered) {
            this.gameOverTrigger(false);
        }
        else if (this.gameState.goalPowered) {
            this.gameOverTrigger(true);
        }
    }

    getTileAt(x, y) {
        return this.circuitBoard[x][y];
    }

    serialize() {
        var board = Array.from(Array(boardSizes[boardSizeIdx].X), () => new Array(boardSizes[boardSizeIdx].Y));

        for (let i = 0; i < boardSizes[boardSizeIdx].X; i++) {
            for (let j = 0; j < boardSizes[boardSizeIdx].Y; j++) {
                board[i][j] = TileSerializer.serialize(logic.getTileAt(i, j));
            }
        }

        return {
            tiles: board,
            gState: this.gameState
        };
    }
}

