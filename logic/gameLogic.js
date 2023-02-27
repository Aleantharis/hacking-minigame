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

    static getRandomMissingDirection(input) {
        var x = this.getMissingDirections(input);
        return x[Math.floor(Math.random() * x.length)];
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

    static getRandom() {
        return Directions.getByIndex(Math.floor(Math.random() * 4));
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
            this.IsPowered = this.gameState.boardPowered;
            this.OpenEdges.forEach(edge => {
                if(this.Neighbors[edge] !== null && this.Neighbors[edge].IsPowered !== this.gameState.boardPowered) {
                    this.Neighbors[edge].power(Directions.inverse(edge));
                }
            });
            //this.OpenEdges.forEach(direction => this.Neighbors[direction] !== null && this.Neighbors[direction].IsPowered !== this.gameState.boardPowered && this.Neighbors[direction].power(Directions.inverse(direction)));
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
                        return "━";
                    }

                    if (this.OpenEdges.indexOf(Directions.Down) >= 0) {
                        return "┏";
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

    getPrintColor() {
        if (this.IsPowered) {
            return "cyan";
        }
        return undefined;
    }
}

class RotatingTile extends Tile {
    clickTrigger() {
        // Only allow rotation when board is not powered
        if (!this.gameState.boardPowered) {
            var temp = [];
            this.OpenEdges.forEach(element => temp.push(Directions.rotate(element, true)));
            this.OpenEdges = temp;
        }
    }

    getPrintColor() {
        if (this.IsPowered) {
            return "cyan";
        }
        return "powderblue";
    }
}

class GoalTile extends Tile {
    OpenEdges = [Directions.Up, Directions.Right, Directions.Down, Directions.Left];

    power(incomingFrom) {
        this.IsPowered = this.gameState.boardPowered;
        this.gameState.goalPowered = this.gameState.boardPowered;
    }

    getStringRepresentation() {
        return "◎";
    }

    getPrintColor() {
        if (this.IsPowered) {
            return "gold";
        }
        return "goldenrod";
    }
}

class TrapTile extends Tile {
    OpenEdges = [Directions.Up, Directions.Right, Directions.Down, Directions.Left];

    power(incomingFrom) {
        this.IsPowered = this.gameState.boardPowered;
        this.gameState.trapPowered = this.gameState.boardPowered;
    }

    getStringRepresentation() {
        return "◍";
    }

    getPrintColor() {
        if (this.IsPowered) {
            return "red";
        }
        return "darkred";
    }
}

class PowerTile extends Tile {
    OpenEdges = [Directions.Up, Directions.Right, Directions.Down, Directions.Left];

    clickTrigger() {
        this.gameState.boardPowered = !this.gameState.boardPowered;
        this.power(Directions.Up);
    }

    getStringRepresentation() {
        return "◉";
    }

    getPrintColor() {
        if (this.IsPowered) {
            return "green";
        }
        return "darkgreen";
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
    sizeX;
    sizeY;
    boardPowered = false;
    goalPowered = false;
    trapPowered = false;
    DEBUG = true;

    constructor(difficulty, sizeX, sizeY) {
        this.difficulty = difficulty;
        this.sizeX = sizeX;
        this.sizeY = sizeY;
    }
}

export class GameLogic {
    static difficultyValues = {
        0: new DifficultySettings(0.2, 0),
        1: new DifficultySettings(0.35, 1),
        2: new DifficultySettings(0.45, 2)
    }

    circuitBoard;
    gameState;
    gameOverTrigger;

    constructor(difficulty, sizeX, sizeY, gameOverTrigger) {
        this.gameState = new GameState(difficulty, sizeX, sizeY);
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
                tempY = sizeY - 1;
                break;
            case 2: // Bottom Edge
                tempX = sizeX - 1;
                tempY = Math.floor(Math.random() * sizeY);
                break;
            case 3: // Left Edge
                tempX = Math.floor(Math.random() * sizeX);
                tempY = 0;
                break;
        }

        var powerTile = new PowerTile(tempX, tempY, this.gameState);
        ///TODO: Change How goal is spawned in relation to power - also maybe spawn more than one goal (adapt gamestate victory checks)
        var goalTile = new GoalTile(sizeX - tempX - 1, sizeY - tempY - 1, this.gameState);

        this.circuitBoard[tempX][tempY] = powerTile;
        this.circuitBoard[goalTile.X][goalTile.Y] = goalTile;

        // Init trap tiles
        var trapTiles = 0;
        while (trapTiles < GameLogic.difficultyValues[difficulty].trapTileAmount) {
            var trapX = -1;
            var trapY = -1;

            do {
                trapX = Math.floor(Math.random() * sizeX);
                trapY = Math.floor(Math.random() * sizeY);
            } while (this.circuitBoard[trapX][trapY] !== undefined);

            this.circuitBoard[trapX][trapY] = new TrapTile(trapX, trapY, this.gameState);
            trapTiles++;
        }

        var maxFixedTiles = sizeX * sizeY * GameLogic.difficultyValues[difficulty].fixedTilePercentage;

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
                    var ran = Math.floor(Math.random() * 6);
                    // i am too stupid to create a mathematical formula for this
                    var edgeAmnt = (ran < 3 ? 0 : ran < 5 ? 1 : 2) + 2;
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