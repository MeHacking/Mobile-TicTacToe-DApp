// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract TicTacToeGame {
    enum GameStatus { WaitingForPlayer, InProgress, Finished }

    address public player1;
    address public player2;
    address public currentPlayer;
    address public winner;
    bool public isDraw;
    uint256 public stake;
    GameStatus public status;

    uint8[3][3] public board;

    constructor(address _player1) payable {
        require(msg.value > 0, "Stake required");
        player1 = _player1;
        stake = msg.value;
        status = GameStatus.WaitingForPlayer;
    }

    function joinGame() external payable {

        require(status == GameStatus.WaitingForPlayer, "Game is not open");
        require(msg.value == stake, "Stake must match");
        require(msg.sender != player1, "Cannot join your own game");

        player2 = msg.sender;
        currentPlayer = player1;
        status = GameStatus.InProgress;
    }

    function makeMove(uint x, uint y) external {
        require(status == GameStatus.InProgress, "Game not in progress");
        require(msg.sender == currentPlayer, "Not your turn");
        require(x < 3 && y < 3, "Invalid position");
        require(board[x][y] == 0, "Cell already occupied");

        // Mark move (1 = player1, 2 = player2)
        uint8 playerMark = msg.sender == player1 ? 1 : 2;
        board[x][y] = playerMark;

        // Chech the winner
        if (checkWinner(playerMark)) {
            winner = msg.sender;
            status = GameStatus.Finished;

            // Payout the winner
            payable(winner).transfer(stake * 2);
        } else if (isBoardFull()) {
            isDraw = true;
            status = GameStatus.Finished;

            // Return stakes
            payable(player1).transfer(stake);
            payable(player2).transfer(stake);
        } else {
            // Prebaci red na drugog igrača
            currentPlayer = msg.sender == player1 ? player2 : player1;
        }
    }

    function checkWinner(uint8 mark) private view returns (bool) {
        
        // Rows and Collumns
        for (uint i = 0; i < 3; i++) {
            if (
                (board[i][0] == mark && board[i][1] == mark && board[i][2] == mark) ||
                (board[0][i] == mark && board[1][i] == mark && board[2][i] == mark)
            ) {
                return true;
            }
        }

        // Diagonals
        if (
            (board[0][0] == mark && board[1][1] == mark && board[2][2] == mark) ||
            (board[0][2] == mark && board[1][1] == mark && board[2][0] == mark)
        ) {
            return true;
        }

        return false;
    }

    function isBoardFull() private view returns (bool) {
        for (uint i = 0; i < 3; i++) {
            for (uint j = 0; j < 3; j++) {
                if (board[i][j] == 0) {
                    return false;
                }
            }
        }
        return true;
    }

    function getBoard() public view returns (uint8[3][3] memory) {
        return board;
    }

    function getCurrentPlayer () external view returns (address) {
        return currentPlayer;
    }

    function getStatus() public view returns (string memory) {
        if (status == GameStatus.WaitingForPlayer) {
             return "WaitingForPlayers";
        } else if (status == GameStatus.InProgress) {
            return "InProgress";
        } else if (status == GameStatus.Finished) {
            return "Finished";
        } else {
            return "Unknown";
        }
    }

}