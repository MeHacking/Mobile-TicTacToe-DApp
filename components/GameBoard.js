import React, { useEffect, useState, useCallback } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { ethers } from "ethers";
import TicTacToeGameABI from './contracts/TicTacToeGame.json';

const GameBoard = ({ gameAddress, provider, signerProvider, account }) => {
  const [readContract, setReadContract] = useState(null);
  const [writeContract, setWriteContract] = useState(null);
  const [board, setBoard] = useState([
    ["", "", ""],
    ["", "", ""],
    ["", "", ""],
  ]);
  const [currentPlayer, setCurrentPlayer] = useState("");
  const [winner, setWinner] = useState("");
  const [isPlayerTurn, setIsPlayerTurn] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [player1, setPlayer1] = useState("");

  // Inicijalizacija kontrakta
  useEffect(() => {
    if (!provider || !signerProvider || !account) return;

    const readInstance = new ethers.Contract(gameAddress, TicTacToeGameABI.abi, provider);
    const writeInstance = new ethers.Contract(gameAddress, TicTacToeGameABI.abi, signerProvider.getSigner());

    setReadContract(readInstance);
    setWriteContract(writeInstance);

    loadGameData(readInstance, account);
  }, [gameAddress, provider, signerProvider, account]);

  const loadGameData = useCallback(async (contractInstance = readContract, currentAccount = account) => {
    if (!contractInstance || !currentAccount) return;

    try {
      const rawBoard = await contractInstance.getBoard();
      const parsedBoard = rawBoard.map((row) =>
        row.map((cell) => {
          if (cell === "1" || cell === 1 || cell === 1n) return "X";
          if (cell === "2" || cell === 2 || cell === 2n) return "O";
          return "";
        })
      );
      setBoard(parsedBoard);

      const player1Address = await contractInstance.player1();
      setPlayer1(player1Address);

      const currentPlayerAddress = await contractInstance.getCurrentPlayer();
      setCurrentPlayer(currentPlayerAddress);

      const winnerAddress = await contractInstance.winner();
      setWinner(winnerAddress);

      setGameOver(winnerAddress !== "0x0000000000000000000000000000000000000000");
      setIsPlayerTurn(currentAccount.toLowerCase() === currentPlayerAddress.toLowerCase());
    } catch (error) {
      console.error("Greška pri učitavanju podataka:", error);
      Alert.alert("Error", "Greška pri učitavanju podataka.");
    }
  }, [readContract, account]);

  const handleCellPress = async (row, col) => {
    if (!isPlayerTurn || gameOver || !writeContract) return;
    if (board[row][col] !== "") return;

    const updatedBoard = board.map((r) => [...r]);
    updatedBoard[row][col] = currentPlayer.toLowerCase() === player1.toLowerCase() ? "X" : "O";
    setBoard(updatedBoard);

    try {
      const tx = await writeContract.makeMove(row, col);
      await tx.wait();
      await loadGameData();
    } catch (err) {
      console.error("Greška pri potezu:", err);
      Alert.alert("Error", "Transakcija nije uspela.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>GAME</Text>

      {/* Game Status */}
      {gameOver ? (
        <Text style={styles.status}>
          {winner === "0x0000000000000000000000000000000000000000"
            ? "It's a draw!"
            : winner?.toLowerCase() === account.toLowerCase()
            ? "You won!"
            : "Opponent won!"}
        </Text>
      ) : (
        <Text style={styles.status}>
          Turn: {currentPlayer.toLowerCase() === account.toLowerCase() ? "You" : "Opponent"}
        </Text>
      )}

      {/* Game Board */}
      <View style={styles.board}>
        {board.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.boardRow}>
            {row.map((cell, colIndex) => (
              <TouchableOpacity
                key={colIndex}
                style={[styles.cell, isPlayerTurn && !gameOver && cell === "" ? styles.clickable : null]}
                onPress={() => handleCellPress(rowIndex, colIndex)}
              >
                <Text style={styles.cellText}>{cell}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 15, alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  status: { fontSize: 18, marginVertical: 10 },
  board: { marginTop: 20 },
  boardRow: { flexDirection: "row" },
  cell: {
    width: 80,
    height: 80,
    borderWidth: 1,
    borderColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  clickable: { backgroundColor: "#e0e0e0" },
  cellText: { fontSize: 32, fontWeight: "bold" },
});

export default GameBoard;
