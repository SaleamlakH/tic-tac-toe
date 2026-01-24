'use strict'

const gameBoard = (function GameBoard() {
    let board = [
        ['', '', ''],
        ['', '', ''],
        ['', '', '']
    ];
    
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

    return {board, print, addMark, reset};
})();


function Player(name, mark) {
    let score;

    return {name, mark, score};
}

const player1 = Player('Sale', 'S');
const player2 = Player('Rekik', 'R');