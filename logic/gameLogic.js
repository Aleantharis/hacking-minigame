// https://dev.to/nehal_mahida/oops-in-javascript-with-easy-to-understand-examples-2ppn
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Static_initialization_blocks
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/static
// https://stackoverflow.com/questions/950087/how-do-i-include-a-javascript-file-in-another-javascript-file
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import

import { Directions, Tile, RotatingTile, GoalTile, TrapTile, PowerTile, DifficultySettings, GameState, TileSerializer } from "./tiles.js"
import { PathGenerator } from "./randomPathGenerator.js";


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

        this.#pathGenCreateBoard(difficulty, sizeX, sizeY);

        this.gameState.boardPowered = false;
        this.gameState.goalPowered = false;
        this.gameState.trapPowered = false;
    }

    #pathGenCreateBoard(difficulty, sizeX, sizeY) {
        this.#initBoard(sizeX, sizeY);

        let gen = new PathGenerator(sizeX, sizeY, this.#powX, this.#powY, sizeX - this.#powX - 1, sizeY - this.#powY - 1);

        // path has been generated  now fill up path with random tiles (apply fixedtile percentage) - generate in "correct" orientation, then rotate them randomly
        let path = gen.generate();

        var maxFixedTiles = Math.round(sizeX * sizeY * GameLogic.difficultyValues[difficulty].fixedTilePercentage);

        for (let i = 1; i < path.length - 1; i++) {
            var dirToParent = Directions.inverse(Directions.getDirectionFromCoordinateDiff(path[i].X - path[i - 1].X, path[i].Y - path[i - 1].Y));
            var dirToChild = Directions.getDirectionFromCoordinateDiff(path[i + 1].X - path[i].X, path[i + 1].Y - path[i].Y);

            var temp;
            // generate fixed tile if rng allows for it
            if (maxFixedTiles-- > 0 && Math.random() <= GameLogic.difficultyValues[difficulty].fixedTilePercentage) {
                temp = new Tile(path[i].X, path[i].Y, this.gameState);
            }
            else {
                temp = new RotatingTile(path[i].X, path[i].Y, this.gameState);
            }

            temp.OpenEdges.push(dirToParent);
            temp.OpenEdges.push(dirToChild);

            // randomly add a third direction 
            if (Math.floor(Math.random() * 100) < 15) {
                var edge = Directions.getRandomMissingDirection(temp.OpenEdges);
                temp.OpenEdges.push(edge);
            }

            // randomly rotate tile
            var rotations = Math.floor(Math.random() * 4);
            for (let j = 0; j <= rotations; j++) {
                temp.clickTrigger();
            }

            this.circuitBoard[path[i].X][path[i].Y] = temp;
        }

        //fill up rest of board with random tiles (apply trap percentage)
        this.#fillBoardWithTiles(difficulty, sizeX, sizeY, maxFixedTiles);
    }

    #bruteForceCreateBoard(difficulty, sizeX, sizeY) {
        this.#initBoard(sizeX, sizeY);

        var maxFixedTiles = Math.round(sizeX * sizeY * GameLogic.difficultyValues[difficulty].fixedTilePercentage);

        this.#fillBoardWithTiles(difficulty, sizeX, sizeY, maxFixedTiles);
    }

    #initBoard(sizeX, sizeY) {
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
    }

    #fillBoardWithTiles(difficulty, sizeX, sizeY, maxFixedTiles) {
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
            this.circuitBoard[tr.X][tr.Y] = TrapTile.fromTile(this.circuitBoard[tr.X][tr.Y]);
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
        var board = Array.from(Array(this.gameState.sizeX), () => new Array(this.gameState.sizeY));

        for (let i = 0; i < this.gameState.sizeX; i++) {
            for (let j = 0; j < this.gameState.sizeY; j++) {
                board[i][j] = TileSerializer.serialize(this.circuitBoard[i][j]);
            }
        }

        return {
            tiles: board,
            gState: {
                difficulty: this.gameState.difficulty,
                sizeX: this.gameState.sizeX,
                sizeY: this.gameState.sizeY,
                powX: this.gameState.powX,
                powY: this.gameState.powY,
                debug: this.gameState.DEBUG
            }
        };
    }
}


// https://stackoverflow.com/questions/34954652/java-algorithm-for-generating-random-path-in-2d-char-array
// https://www.google.com/search?q=generate+random+path+from+a+to+b+in+2d+coordinate+system&oq=generate+random+path+from+a+to+b+in+2d+coordinate+system&aqs=chrome..69i57.9451j0j1&sourceid=chrome&ie=UTF-8