'use strict'

const gameBoard = (function GameBoard() {
    let board = [
        ['', '', ''],
        ['', '', ''],
        ['', '', '']
    ];

    const getBoard = () => board;
    
    // return the gameBoard object 
    // so other methods can be chained
    const addMark = function(mark, {row, column}) {
        if (board[row][column]) {
            let message = "The spot is already taken!\nPlease select free spot.";
            
            logMessage(message);
            return this;
        }
        
        board[row][column] = mark;
        return this;
    }

    const reset = function() {
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                board[i][j] = '';
            }
        };

        return this;
    }

    const print = () => {
        console.table(board);
    }

    return {getBoard, print, addMark, reset};
})();

function Player(name, mark) {
    let score;

    return {name, mark, score};
}

function Game(currentPlayer, nextPlayer) {
    let gameRound = 1;

    const getCurrentPlayer = () => currentPlayer;
    
    const playRound = (gameBoard, position) => {
        gameBoard.addMark(currentPlayer.mark, position);

        // change current player
        const temp = currentPlayer;
        currentPlayer = nextPlayer;
        nextPlayer = temp;

        ++gameRound;
    }

    const checkWin = (board, {row, column}) => {
        const winRow = board[row].every(mark => {
            return mark === currentPlayer.mark;
        });

        const winColumn = board.every((row) => {
            return row[column] === currentPlayer.mark;
        });

        const winDiagonal = checkDiagonalWin(board, row, column);
        
        return winRow || winColumn || winDiagonal;
    }

    const checkDiagonalWin = (board, row, column) => {

        // diagonals drawn from left to right
        let winTopBottomDiagonal = false;
        let winBottomTopDiagonal = false;

        if (row === column || row + column === 2) {
            winTopBottomDiagonal = board.every((row, index) => {
                return row[index] === currentPlayer.mark;
            });

            winBottomTopDiagonal = board.every((row, index) => {
                return row[2 - index] === currentPlayer.mark;
            });
        }

        return winTopBottomDiagonal || winBottomTopDiagonal;
    }

    // --- Check for tie game end ---

    const checkTie = (board) => {
        const rowTie = !isRowPossibleToWin(board);
        const columnTie = !isColumnPossibleToWin(board);
        const diagonalTie = !isDiagonalPossibleToWin(board);

        return rowTie && columnTie && diagonalTie;
    }

    const isRowPossibleToWin = (board) => {
        return board.some(row => {
            return row
                .filter(mark => mark !== '')
                .every((mark, index, arr) => arr[0] == mark);
        });
    }

    const isColumnPossibleToWin = (board) => {
        const invertedBoard = board.reduce((column, row, index) => {
            column[0][index] = row[0];
            column[1][index] = row[1];
            column[2][index] = row[2];

            return column;
        }, [[], [], []]);

        return invertedBoard.some(row => {
            return row
                .filter(mark => mark !== '')
                .every((mark, index, arr) => arr[0] == mark);
        });
    }

    const isDiagonalPossibleToWin = (board) => {
        
        // Diagonals draw from left to right
        const topBottomDiagonal = board
            .map((row, index) => row[index])
            .filter(mark => mark !== '')
            .every((mark, index, arr) =>  arr[0] === mark);

        const bottomTopDiagonal = board
            .map((row, index) => row[2 - index])
            .filter(mark => mark !== '')
            .every((mark, index, arr) => arr[0] === mark);

        return topBottomDiagonal || bottomTopDiagonal;
    }

    return {getCurrentPlayer, playRound, checkWin, checkTie};
}

function logMessage(message) {
    console.log(message);
}

const player1 = Player('Sale', 'S');
const player2 = Player('Rekik', 'R');
const position = {row: 0, column: 0};
gameBoard.addMark('o', position).print();

const game = Game(player1, player2);
const isTie = game.checkTie(gameBoard.getBoard());
console.log(isTie);