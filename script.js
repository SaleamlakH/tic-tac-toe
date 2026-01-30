'use strict'

const gameBoard = (function () {
    let board = [
        ['', '', ''],
        ['', '', ''],
        ['', '', '']
    ];

    const getBoard = () => board;
    
    // return the gameBoard object 
    // so other methods can be chained
    const addMark = function(mark, {row, column}) {
        board[row][column] = mark;
        return this;
    }

    const isFreeCell = ({row, column}) => {
         if (board[row][column]) {
            return false;
        }
        return true;
    }

    const reset = function() {
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                board[i][j] = '';
            }
        };

        return this;
    }

    return {getBoard, addMark, isFreeCell, reset};
})();

function Player(name, mark) {
    let score;

    return {name, mark, score};
}

function Game(currentPlayer, nextPlayer) {
    let gameRound = 1;

    const getCurrentPlayer = () => currentPlayer;

    const getRound = () => gameRound;
    
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

    return {getCurrentPlayer, getRound, playRound};
}

const boardDisplay = (function () {
    const gameGridBoard = document.querySelector('.game-grid-board');
    const playerName = document.querySelector('.player-info .name');
    const gameRound = document.querySelector('.round-info .round');
    const gameMessage = document.querySelector('.game-messages');

    const displayGameInfo = (game, message = 'Ongoing') => {
        playerName.textContent = game.getCurrentPlayer().name;
        gameRound.textContent = game.getRound();
        gameMessage.textContent = message;
    }
    
    const createCells = (game) => {
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                const cell = document.createElement('div');
                
                cell.setAttribute('data-row', i);
                cell.setAttribute('data-column', j);
                attachEventListener(cell, game);
                gameGridBoard.append(cell);
            }
        }
    }

    const attachEventListener = (cell, game) => {
        cell.addEventListener('click', (e) => {
            playGame(e, game);
        });
    }

    const drawMark = (event, mark) => {
        event.currentTarget.textContent = mark;
    }

    return {createCells, drawMark, displayGameInfo};
})();

(function Dialog() {
    const dialog = document.querySelector('dialog');
    const form = document.querySelector('form');
    const submitBtn = document.querySelector('#submit-btn');

    dialog.showModal();

    submitBtn.addEventListener('click', (e) => {
        const {player1, player2} = getInputs();
        const game = Game(player1, player2);

        boardDisplay.createCells(game);
        boardDisplay.displayGameInfo(game, 'started');
        
        dialog.close();
        
        const gameDisplay = document.querySelector('.game');
        gameDisplay.classList.toggle('started');

        e.preventDefault();
    });

    const getInputs = () => {
        const formData = [...new FormData(form)];
        const players = formData.reduce((obj, [key, value]) => {
            obj[key] = value;
            return obj;
        }, {});

        return {
            player1: {
                name: players.player1_name,
                mark: players.player1_mark
            },
            player2: {
                name: players.player2_name,
                mark: players.player2_mark
            }
        };
    };
})();

function playGame(event, game) {
    const position = event.currentTarget.dataset;
    
    if (!gameBoard.isFreeCell(position)) {
        let message = 'Already taken';
        boardDisplay.displayGameInfo(game, message);
        return;
    }
    
    boardDisplay.drawMark(event, game.getCurrentPlayer().mark);
    gameBoard.addMark(game.getCurrentPlayer().mark, position);
    
    const roundResult = game.playRound(gameBoard.getBoard(), position);
    if (roundResult.win) {
        const message = `Wins!`;
        boardDisplay.displayGameInfo(game, message);
        return;
    } 

    if (roundResult.tie) {
        const message = `Tied!`;
        boardDisplay.displayGameInfo(game, message);
        return;
    }

    boardDisplay.displayGameInfo(game);
}; 