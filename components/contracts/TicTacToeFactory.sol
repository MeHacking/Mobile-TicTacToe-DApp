// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./TicTacToeGame.sol";

contract TicTacToeFactory {
    TicTacToeGame[] public games;

    event GameCreated(address indexed creator, address gameAddress, uint stake);

    function createGame() external payable {
        require(msg.value > 0, "Stake must be greater than 0");
        TicTacToeGame game = (new TicTacToeGame){value: msg.value}(msg.sender);
        games.push(game);
        emit GameCreated(msg.sender, address(game), msg.value);
    }

    function getAllGames() external view returns (TicTacToeGame[] memory) {
        return games;
    }
}