// https://dev.to/nehal_mahida/oops-in-javascript-with-easy-to-understand-examples-2ppn
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Static_initialization_blocks
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/static
// https://stackoverflow.com/questions/950087/how-do-i-include-a-javascript-file-in-another-javascript-file
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import

class Directions {
    static #isInternalConstructing = false;

    static Up;
    static Right;
    static Down;
    static Left;

    static {
        Directions.#isInternalConstructing = true;
        Directions.Up = new Directions("up", 0);
        Directions.Right = new Directions("right", 1);
        Directions.Down = new Directions("down", 2);
        Directions.Left = new Directions("left", 3);
        Directions.#isInternalConstructing = false;
    }

    constructor(name, idx) {
        if (!Directions.#isInternalConstructing) {
            throw new TypeError("Directions is not constructable");
        }
        this.name = name;
        this.idx = idx;
    }

    static inverse(direction) {
        switch (direction.name) {
            case "up":
                return Directions.Down;
            case "right":
                return Directions.Left;
            case "down":
                return Directions.Up;
            case "left":
                return Directions.Right;
            default:
                throw new Error("Invalid Direction");
        }
    }

    static rotate(direction, clockwise) {
        switch (direction.name) {
            case "up":
                return clockwise ? Directions.Right : Directions.Left;
            case "right":
                return clockwise ? Directions.Down : Directions.Up;
            case "down":
                return clockwise ? Directions.Left : Directions.Right;
            case "left":
                return clockwise ? Directions.Up : Directions.Down;
            default:
                throw new Error("Invalid Direction");
        }
    }

    static getMissingDirections(input) {
        return [Directions.Up, Directions.Right, Directions.Down, Directions.Left].filter(n => !input.includes(n));
    }

    static getByIndex(index) {
        switch (index) {
            case 0:
                return Directions.Down;
            case 1:
                return Directions.Left;
            case 2:
                return Directions.Up;
            case 3:
                return Directions.Right;
            default:
                throw new Error("Invalid Index");
        }
    }

    static random() {
        return getByIndex(Math.floor(Math.random() * 4));
    }
}


class Tile {
    X = -1;
    Y = -1;
    Neighbors;
    OpenEdges = [];
    IsPowered = false;
    gameState;

    constructor(X, Y, gameState) {
        this.X = X;
        this.Y = Y;
        this.gameState = gameState;

        this.Neighbors = new Map();
        this.Neighbors.set(Directions.Up, null);
        this.Neighbors.set(Directions.Right, null);
        this.Neighbors.set(Directions.Down, null);
        this.Neighbors.set(Directions.Left, null);
    }

    getNeighborCoordinates(direction) {
        switch (direction.name) {
            case "up":
                return { X: (this.X - 1), Y: (this.Y) };
            case "right":
                return { X: (this.X), Y: (this.Y + 1) };
            case "down":
                return { X: (this.X + 1), Y: (this.Y) };
            case "left":
                return { X: (this.X), Y: (this.Y - 1) };
            default:
                throw new Error("Invalid Direction");
        }
    }

    // Triggered by neighbor
    power(incomingFrom) {
        if (this.OpenEdges.indexOf(incomingFrom) > -1) {
            this.IsPowered = true;
            this.OpenEdges.forEach(direction => this.Neighbors[direction] !== null && !this.Neighbors[direction].IsPowered && this.Neighbors[direction].power(Directions.inverse(direction)));
        }
    }

    clickTrigger() {
        // Do nothing
        if (this.gameState.DEBUG) {
            console.table(this);
        }
    }

    getStringRepresentation() {
        switch (this.OpenEdges.length) {
            case 0:
                return "O";
            case 1:
                switch (this.OpenEdges[0].name) {
                    case "up":
                        return "╹";
                    case "right":
                        return "╺";
                    case "down":
                        return "╻";
                    case "left":
                        return "╸";
                    default:
                        throw new Error("Invalid Direction");
                }
            case 2:
                if (this.OpenEdges.indexOf(Directions.Up) >= 0) {
                    if (this.OpenEdges.indexOf(Directions.Left) >= 0) {
                        return "┛";
                    }

                    if (this.OpenEdges.indexOf(Directions.Down) >= 0) {
                        return "┃";
                    }

                    if (this.OpenEdges.indexOf(Directions.Right) >= 0) {
                        return "┗";
                    }
                }
                else if (this.OpenEdges.indexOf(Directions.Right) >= 0) {
                    if (this.OpenEdges.indexOf(Directions.Left) >= 0) {
                        return "┏";
                    }

                    if (this.OpenEdges.indexOf(Directions.Down) >= 0) {
                        return "━";
                    }
                }
                else {
                    return "┓";
                }
            case 3:
                switch (Directions.getMissingDirections(this.OpenEdges)[0].name) {
                    case "up":
                        return "┳";
                    case "right":
                        return "┫";
                    case "down":
                        return "┻";
                    case "left":
                        return "┣";
                    default:
                        throw new Error("Invalid Direction");
                }
            case 4: return "╋";
            default:
                throw new Error("Invalid Amount of Open Edges");
        }
    }
}

class RotatingTile extends Tile {
    clickTrigger() {
        temp = [];
        this.OpenEdges.forEach(element => temp += Direction.rotate(element, true));
        this.OpenEdges = temp;
    }
}

class GoalTile extends Tile {
    OpenEdges = [Directions.Up, Directions.Right, Directions.Down, Directions.Left];

    power(incomingFrom) {
        this.gameState.goalPowered = true;
    }
}

class TrapTile extends Tile {
    OpenEdges = [Directions.Up, Directions.Right, Directions.Down, Directions.Left];

    power(incomingFrom) {
        this.gameState.trapPowered = true;
    }
}

class PowerTile extends Tile {
    OpenEdges = [Directions.Up, Directions.Right, Directions.Down, Directions.Left];

    clickTrigger() {
        this.gameState.boardPowered = true;
        this.power();
    }
}

class DifficultySettings {
    fixedTilePercentage;
    trapTileAmount;

    constructor(fixedTilePercentage, trapTileAmount) {
        this.fixedTilePercentage = fixedTilePercentage;
        this.trapTileAmount = trapTileAmount;
    }
}

class GameState {
    difficulty;
    boardPowered = false;
    goalPowered = false;
    trapPowered = false;
    DEBUG = true;

    constructor(difficulty) {
        this.difficulty = difficulty;
    }
}

export class GameLogic {
    static difficultyValues = {
        0: new DifficultySettings(0.1, 0),
        1: new DifficultySettings(0.2, 1),
        2: new DifficultySettings(0.4, 2)
    }

    circuitBoard;
    gameState;
    gameOverTrigger;

    constructor(difficulty, sizeX, sizeY, gameOverTrigger) {
        this.gameState = new GameState(difficulty);
        this.gameOverTrigger = gameOverTrigger;

        // init game board
        this.circuitBoard = Array.from(Array(sizeX), () => new Array(sizeY));

        var tempX = -1;
        var tempY = -1;
        // generate goal & power tile
        switch (Math.floor(Math.random() * 4)) {
            case 0: // Top Edge
                tempX = 0;
                tempY = Math.floor(Math.random() * sizeY);
                break;
            case 1: // Right Edge
                tempX = Math.floor(Math.random() * sizeX);
                tempY = sizeY;
                break;
            case 2: // Bottom Edge
                tempX = sizeX;
                tempY = Math.floor(Math.random() * sizeY);
                break;
            case 3: // Left Edge
                tempX = Math.floor(Math.random() * sizeX);
                tempY = 0;
                break;
        }

        var powerTile = new PowerTile(tempX, tempY);
        var goalTile = new GoalTile(sizeX - tempX, sizeY - tempY);

        this.circuitBoard[tempX, tempY] = powerTile;
        this.circuitBoard[goalTile.X, goalTile.X] = goalTile;

        // Init trap tiles
        var trapTiles = 0;
        while (trapTiles < GameLogic.difficultyValues[difficulty].trapTileAmount) {
            var trapX = -1;
            var trapY = -1;

            do {
                trapX = Math.floor(Math.random() * sizeX);
                trapY = Math.floor(Math.random() * sizeY);
            } while (this.circuitBoard[trapX][trapY] === undefined);

            this.circuitBoard[trapX][trapY] = new TrapTile(trapX, trapY, this.gameState);
        }

        // Init Rest of tiles
        for (let i = 0; i < sizeX; i++) {
            for (let j = 0; j < sizeY; j++) {
                if (this.circuitBoard[i][j] === undefined) {
                    var temp;
                    // generate fixed tile if rng allows for it
                    if (Math.random <= GameLogic.difficultyValues[difficulty].fixedTilePercentage) {
                        temp = new Tile(i, j, this.gameState);
                    }
                    else {
                        temp = new RotatingTile(i, j, this.gameState);
                    }

                    // Add random amount of open edges to tile
                    var edgeAmnt = Math.floor(Math.random() * 3) + 2;
                    for (let k = 0; k < edgeAmnt; k++) {
                        var dir;
                        do {
                            dir = Directions.random();
                        } while (temp.OpenEdges.indexOf(dir) === -1);
                        temp.OpenEdges.push(dir);
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
                        this.circuitBoard[i][j].Neighbors[dir] = this.circuitBoard[n.X][n.Y];
                    }
                }
            }
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
}