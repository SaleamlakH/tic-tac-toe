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
    
    const playRound = (board, position) => {
        const isWinningMove = checkWin(board, position)
        if (isWinningMove) return {win: true, tie: false};

        const isTie = checkTie(board);
        if (isTie) return {win: false, tie: true};

        swapPlayers();
        ++gameRound;
        return {win: false, tie: false};
    }

    const swapPlayers = () => {
        const temp = currentPlayer;
        currentPlayer = nextPlayer;
        nextPlayer = temp;
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

    return {getCurrentPlayer, playRound};
}

const boardDisplay = (function BoardDisplay() {
    const gameGridBoard = document.querySelector('.game-grid-board');

    const createCells = (game, gameBoard) => {
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                const cell = document.createElement('div');
                
                cell.setAttribute('data-row', i);
                cell.setAttribute('data-column', j);
                attachEventListener(cell, game, gameBoard);
                gameGridBoard.append(cell);
            }
        }
    }

    const attachEventListener = (cell, game, gameBoard) => {
        cell.addEventListener('click', (e) => {
            const mark = game.getCurrentPlayer().mark;
            const position = e.currentTarget.dataset;
            
            gameBoard.addMark(mark, position);
            drawMark(e, mark);
        });
    }

    const drawMark = (event, mark) => {
        event.currentTarget.textContent = mark;
    }

    return {createCells};
})();

function logMessage(message) {
    console.log(message);
}


// Game module
const game = () => {
    const player1name = prompt('Enter your name: ', 'rekik');
    const player2name = prompt('Enter another player name: ', 'ezra');
    const whoPlaysFirst = prompt(`Who plays first: 1. ${player1name} or 2. ${player2name}`);

    if (whoPlaysFirst == 1) {
        const currentPlayer = Player(player1name, 'X');
        const nextPlayer = Player(player2name, 'O');
        
        return Game(currentPlayer, nextPlayer);
    } else {
        const currentPlayer = Player(player2name, 'O');
        const nextPlayer = Player(player1name, 'X');

        return Game(currentPlayer, nextPlayer);
    }
};

boardDisplay.createCells(game(), gameBoard);

// IIFE which plays created game
function playGame() {
    let isGameOver = false;
    while (isGameOver) {
        console.clear();
        gameBoard.print();
        let position = prompt('Enter row and column of a spot, e,g. 11:', 11);
        
        const [row, column] = position.split('');
        position = {row, column};
        gameBoard.addMark(game.getCurrentPlayer().mark, position);
        const roundResult = game.playRound(gameBoard.getBoard(), position);

        if (roundResult.win) {
            const message = `${game.getCurrentPlayer().name} Wins!`;
            console.clear();
            gameBoard.print();
            logMessage(message);
            isGameOver = true;
        } 

        if (roundResult.tie) {
            const message = `The game is tied!`;
            console.clear();
            gameBoard.print();
            logMessage(message);
            isGameOver = true;
        }
    }
}; 