self.importScripts("./tiles.js");

self.onmessage = (e) => {
    CircuitBoardVerifier.verifyCB(e.data, (result) => {
        self.postMessage(result);
    });
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

        // Create tile links - has to be done seperately otherwise array would not be filled
        for (let i = 0; i < sizeX; i++) {
            for (let j = 0; j < sizeY; j++) {
                for (let k = 0; k < 4; k++) {
                    var dir = Directions.getByIndex(k);
                    var n = boardCopy[i][j].getNeighborCoordinates(dir);

                    if (n.X >= 0 && n.X < sizeX && n.Y >= 0 && n.Y < sizeY) {
                        boardCopy[i][j].Neighbors.set(dir, boardCopy[n.X][n.Y]);
                    }
                }
            }
        }

        return boardCopy;
    }

    static verify(circuitBoard) {
        // Create deep clone
        var cc = CircuitBoardVerifier.#cloneBoard(circuitBoard);
        return CircuitBoardVerifier.#checkBoardStateRec(cc, circuitBoard[0][0].gameState.powX, circuitBoard[0][0].gameState.powY, 0);
    }

    static verifyCB(circuitBoard, callback) {
        // Create deep clone
        var cc = CircuitBoardVerifier.#cloneBoard(circuitBoard);
        callback(CircuitBoardVerifier.#checkBoardStateRec(cc, circuitBoard[0][0].gameState.powX, circuitBoard[0][0].gameState.powY, 0));
    }

    static #checkBoardStateRec(circuitBoard, powX, powY, idx) {

        // verify current boardstate
        circuitBoard[powX][powY].clickTrigger();
        if (circuitBoard[powX][powY].gameState.goalPowered && !circuitBoard[powX][powY].gameState.trapPowered) {
            return idx > 0; // instantly fail if generated puzzle is already solved
        }
        // turn power off again to make rotating possible
        circuitBoard[powX][powY].clickTrigger();

        // check if we are still inside the circuitboard
        if (idx >= circuitBoard[powX][powY].gameState.sizeX * circuitBoard[powX][powY].gameState.sizeY) {
            return false;
        }

        // get coords of tile to rotate
        const curY = Math.floor(idx / circuitBoard[powX][powY].gameState.sizeX);
        const curX = idx % circuitBoard[powX][powY].gameState.sizeY;

        // Skip tile if its not a RotatingTile
        if (circuitBoard[curX][curY] instanceof RotatingTile) {
            var rotations = 0;
            switch (circuitBoard[curX][curY].OpenEdges.length) {
                case 2:
                    if (circuitBoard[curX][curY].OpenEdges[0].idx === Directions.inverse(circuitBoard[curX][curY].OpenEdges[1]).idx) {
                        rotations = 1;
                        break;
                    }
                case 3:
                    rotations = 3;
                    break;
            }

            for (let i = 0; i < rotations; i++) {
                circuitBoard[curX][curY].clickTrigger();

                if (this.#checkBoardStateRec(circuitBoard, powX, powY, idx + 1)) {
                    return true;
                }
            }

            // rotate back to initial position on rotateable tiles
            if (rotations > 0) {
                circuitBoard[curX][curY].clickTrigger();
            }
        }

        return false;
    }
}