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
                return Directions.Up;
            case 1:
                return Directions.Right;
            case 2:
                return Directions.Down;
            case 3:
                return Directions.Left;
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

    static copy(tile) {
        const tmp = new this(tile.X, tile.Y, tile.gameState);

        tile.OpenEdges.forEach(e => {
            tmp.OpenEdges.push(e);
        });

        tile.Neighbors.forEach((n, dir) => {
            tmp.Neighbors.set(dir, n);
        });

        // reasssing neighbors
        tmp.Neighbors.forEach((n, dir) => {
            if (n !== null) {
                n.Neighbors.set(Directions.inverse(dir), tmp);
            }
        });

        return tmp;
    }

    copy() {
        const tmp = new this(this.X, this.Y, this.gameState);

        this.OpenEdges.forEach(e => {
            tmp.OpenEdges.push(e);
        });

        this.Neighbors.forEach((n, dir) => {
            tmp.Neighbors.set(dir, n);
        });

        // reasssing neighbors
        tmp.Neighbors.forEach((n, dir) => {
            if (n !== null) {
                n.Neighbors.set(Directions.inverse(dir), tmp);
            }
        });

        return tmp;
    }

    getNeighborCoordinates(direction) {
        switch (direction.name) {
            case "up":
                return { X: (this.X), Y: (this.Y - 1) };
            case "right":
                return { X: (this.X + 1), Y: (this.Y) };
            case "down":
                return { X: (this.X), Y: (this.Y + 1) };
            case "left":
                return { X: (this.X - 1), Y: (this.Y) };
            default:
                throw new Error("Invalid Direction");
        }
    }

    // Triggered by neighbor
    power(incomingFrom) {
        if (this.OpenEdges.indexOf(incomingFrom) > -1) {
            this.IsPowered = this.gameState.boardPowered;
            this.OpenEdges.forEach(edge => {
                if (this.Neighbors.get(edge) !== null && this.Neighbors.get(edge).IsPowered !== this.gameState.boardPowered) {
                    this.Neighbors.get(edge).power(Directions.inverse(edge));
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

    constructor(tile) {
        super(tile.X, tile.Y, tile.gameState);

        this.Neighbors = tile.Neighbors;

        this.Neighbors.forEach((n, dir) => {
            if (n !== null) {
                n.Neighbors.set(Directions.inverse(dir), this);
            }
        });
    }

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
    trapTileAmount; //percentage of max tiles

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
    DEBUG = false;

    constructor(difficulty, sizeX, sizeY, DEBUG) {
        this.difficulty = difficulty;
        this.sizeX = sizeX;
        this.sizeY = sizeY;
        this.DEBUG = DEBUG;
    }

    static copy(gameState) {
        return new this(gameState.difficulty, gameState.sizeX, gameState.sizeY, gameState.DEBUG);
    }
}

export class GameLogic {
    static difficultyValues = {
        0: new DifficultySettings(0.2, 0),
        1: new DifficultySettings(0.35, 0.1),
        2: new DifficultySettings(0.45, 0.2)
    }

    circuitBoard;
    gameState;
    gameOverTrigger;

    #powX = -1;
    #powY = -1;

    constructor(difficulty, sizeX, sizeY, gameOverTrigger, DEBUG) {
        this.gameState = new GameState(difficulty, sizeX, sizeY);
        this.gameOverTrigger = gameOverTrigger;
        this.gameState.DEBUG = DEBUG;

        do {
            this.#createBoard(difficulty, sizeX, sizeY);
        } while(CircuitBoardVerifier.verify(this.circuitBoard, this.#powX, this.#powY));
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
}



class CircuitBoardVerifier {
    static #cloneBoard(circuitBoard) {
        var sizeX = circuitBoard[0][0].gameState.sizeX;
        var sizeY = circuitBoard[0][0].gameState.sizeY;

        var boardCopy = Array.from(Array(sizeX), () => new Array(sizeY));

        for (let i = 0; i < sizeX; i++) {
            for (let j = 0; j < sizeY; j++) {
                boardCopy[i][j] = circuitBoard[i][j].copy();
            }
        }

        return boardCopy;
    }

    static verify(circuitBoard, powX, powY) {
        // Create deep clone
        var cc = CircuitBoardVerifier.#cloneBoard(circuitBoard);
        return CircuitBoardVerifier.#checkBoardStateRec(cc, powX, powY, 0);
    }

    static verifyCB(circuitBoard, powX, powY, callback) {
        // Create deep clone
        var cc = CircuitBoardVerifier.#cloneBoard(circuitBoard);
        callback(CircuitBoardVerifier.#checkBoardStateRec(cc, powX, powY, 0));
    }

    static #checkBoardStateRec(circuitBoard, powX, powY, idx) {
        // verify current boardstate
        circuitBoard[powX][powY].clickTrigger();
        if(circuitBoard.gameState.goalPowered && !circuitBoard.gameState.trapPowered) {
            return true;
        }
        // turn power off again to make rotating possible
        circuitBoard[powX][powY].clickTrigger();

        // check if we are still inside the circuitboard
        if(idx >= circuitBoard.gameState.sizeX * circuitBoard.gameState.sizeY) {
            return false;
        }

        // get coords of tile to rotate
        const curY = Math.floor(idx / circuitBoard.gameState.sizeX);
        const curX = idx % circuitBoard.gameState.sizeY;

        const rotations = 0;
        switch(circuitBoard[curX][curY].OpenEdges.length) {
            case 2:
                if(circuitBoard[curX][curY].OpenEdges[0].idx === Directions.inverse(circuitBoard[curX][curY].OpenEdges[1]).idx) {
                    rotations = 1;
                    break;
                }
            case 3:
                rotations = 3;
                break;    
        }

        for (let i = 0; i < rotations; i++) {
            circuitBoard[curX][curY].clickTrigger();
            
            if(this.#checkBoardStateRec(circuitBoard, powX, powY, idx+1)) {
                return true;
            }
        }

        // rotate back to initial position on rotateable tiles
        if(rotations > 0) {
            circuitBoard[curX][curY].clickTrigger();
        }

        return false;
    }
}