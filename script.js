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
    const addMark = function(mark, index) {
        const [row, column] = index.split('');
        
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
    
    const playRound = (gameBoard, cellIndex) => {
        gameBoard.addMark(currentPlayer.mark, cellIndex);

        // change current player
        const temp = currentPlayer;
        currentPlayer = nextPlayer;
        nextPlayer = temp;

        ++gameRound;
    }

    const checkWin = (board, recentMark) => {
        const row = recentMark.row;
        const column = recentMark.column;

        const winRow = board[row].every(mark => {
            return mark === recentMark.mark;
        });

        const winColumn = board.every((row) => {
            return row[column] === recentMark.mark;
        });

        // diagonals drawn from left to right
        const [
            winTopBottomDiagonal,
            winBottomTopDiagonal
        ] = checkDiagonals(board, recentMark.mark, row, column);
        
        return winRow || winColumn || winTopBottomDiagonal || winBottomTopDiagonal;
    }

    const checkDiagonals = (board, mark, row, column) => {

        // diagonals drawn from left to right
        let winTopBottomDiagonal = false;
        let winBottomTopDiagonal = false;

        const test = board.every((row, index) => {
            return row[index] === mark;
        });

        if (row === column || row + column === 2) {
            winTopBottomDiagonal = board.every((row, index) => {
                return row[index] === mark;
            });

            winBottomTopDiagonal = board.every((row, index) => {
                return row[2 - index] === mark;
            });
        }

        return [winTopBottomDiagonal, winBottomTopDiagonal];
    }

    return {getCurrentPlayer, playRound, checkWin};
}

const player1 = Player('Sale', 'S');
const player2 = Player('Rekik', 'R');

const game = Game(player1, player2);