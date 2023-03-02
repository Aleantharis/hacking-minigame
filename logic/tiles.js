
export class Directions {
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


export class Tile {
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

    deepCopy(tmp) {
        this.OpenEdges.forEach(e => {
            tmp.OpenEdges.push(e);
        });

        // dont assign neighbors, doesnt work until all tiles are updated, becaues of referencing issues
        // this.Neighbors.forEach((n, dir) => {
        //     tmp.Neighbors.set(dir, n);
        // });

        // // reasssing neighbors
        // tmp.Neighbors.forEach((n, dir) => {
        //     if (n !== null) {
        //         n.Neighbors.set(Directions.inverse(dir), tmp);
        //     }
        // });

        return tmp;
    }

    copy() {
        const tmp = new Tile(this.X, this.Y, this.gameState);
        this.deepCopy(tmp);
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

export class RotatingTile extends Tile {
    clickTrigger() {
        // Only allow rotation when board is not powered
        if (!this.gameState.boardPowered) {
            var temp = [];
            this.OpenEdges.forEach(element => temp.push(Directions.rotate(element, true)));
            this.OpenEdges = temp;
        }
    }

    copy() {
        const tmp = new RotatingTile(this.X, this.Y, this.gameState);
        this.deepCopy(tmp);
        return tmp;
    }

    getPrintColor() {
        if (this.IsPowered) {
            return "cyan";
        }
        return "powderblue";
    }
}

export class GoalTile extends Tile {
    OpenEdges = [Directions.Up, Directions.Right, Directions.Down, Directions.Left];

    copy() {
        const tmp = new GoalTile(this.X, this.Y, this.gameState);
        this.deepCopy(tmp);
        return tmp;
    }

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

export class TrapTile extends Tile {
    OpenEdges = [Directions.Up, Directions.Right, Directions.Down, Directions.Left];

    constructor(tile) {
        super(tile.X, tile.Y, tile.gameState);

        if (!(tile instanceof TrapTile)) {
            this.Neighbors = tile.Neighbors;

            this.Neighbors.forEach((n, dir) => {
                if (n !== null) {
                    n.Neighbors.set(Directions.inverse(dir), this);
                }
            });
        }
    }

    copy() {
        const tmp = new TrapTile(this);
        this.deepCopy(tmp);
        return tmp;
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

export class PowerTile extends Tile {
    OpenEdges = [Directions.Up, Directions.Right, Directions.Down, Directions.Left];

    copy() {
        const tmp = new PowerTile(this.X, this.Y, this.gameState);
        this.deepCopy(tmp);
        return tmp;
    }

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

export class DifficultySettings {
    fixedTilePercentage;
    trapTileAmount; //percentage of max tiles

    constructor(fixedTilePercentage, trapTileAmount) {
        this.fixedTilePercentage = fixedTilePercentage;
        this.trapTileAmount = trapTileAmount;
    }
}

export class GameState {
    difficulty;
    sizeX;
    sizeY;
    powX;
    powY;
    boardPowered = false;
    goalPowered = false;
    trapPowered = false;
    DEBUG = false;

    constructor(difficulty, sizeX, sizeY, powX, powY, DEBUG) {
        this.difficulty = difficulty;
        this.sizeX = sizeX;
        this.sizeY = sizeY;
        this.powX = powX;
        this.powY = powY;
        this.DEBUG = DEBUG;
    }

    static copy(gameState) {
        return new this(gameState.difficulty, gameState.sizeX, gameState.sizeY, gameState.powX, gameState.powY, gameState.DEBUG);
    }
}