import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { ethers } from "ethers";
import TicTacToeFactoryABI from "./contracts/TicTacToeFactory.json";
import TicTacToeGameABI from "./contracts/TicTacToeGame.json";

const MyGames = ({ provider, account, tictactoeFactoryAddress }) => {
  const [myGames, setMyGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const loadMyGames = async () => {
      if (!provider || !account) return;
      setLoading(true);

      try {
        const factory = new ethers.Contract(
          tictactoeFactoryAddress,
          TicTacToeFactoryABI.abi,
          provider
        );

        const gameAddresses = await factory.getAllGames();

        const userGames = await Promise.all(
          gameAddresses.map(async (address) => {
            const game = new ethers.Contract(address, TicTacToeGameABI.abi, provider);

            const [player1, player2, stake, winner, status] = await Promise.all([
              game.player1(),
              game.player2(),
              game.stake(),
              game.winner(),
              game.status(),
            ]);

            const isPlayer = [player1, player2].map((a) => a.toLowerCase()).includes(account.toLowerCase());
            if (!isPlayer) return null;

            let resultText = "";
            if (status.toString() === '1') resultText = "In Progress";
            else if (status.toString() === '2') resultText = winner.toLowerCase() === account.toLowerCase() ? "Won" : "Lost";
            else if (status.toString() === '3') resultText = "Draw";
            else resultText = "Pending";

            return {
              address,
              stake: ethers.utils.formatEther(stake),
              result: resultText,
            };
          })
        );

        const filtered = userGames.filter((g) => g !== null);
        setMyGames(filtered);
      } catch (err) {
        console.error("Failed to load your games:", err);
      }

      setLoading(false);
    };

    loadMyGames();
  }, [provider, account, tictactoeFactoryAddress]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Games</Text>

      {loading ? (
        <Text style={styles.info}>Loading your games...</Text>
      ) : !showHistory ? (
        <TouchableOpacity onPress={() => setShowHistory(true)} style={styles.button}>
          <Text style={styles.buttonText}>Check History</Text>
        </TouchableOpacity>
      ) : myGames.length === 0 ? (
        <Text style={styles.info}>No games found for your wallet.</Text>
      ) : (
        <>
          <View style={styles.list}>
            {myGames.map((game, index) => (
              <View key={index} style={styles.gameItem}>
                <Text style={styles.black}>
                  Game: <Text style={styles.value}>{game.address}</Text>
                </Text>
                <Text style={styles.black}>
                  Stake: <Text style={styles.value}>{game.stake} ETH</Text>
                </Text>
                <Text style={styles.black}>
                  Result: <Text style={styles.value}>{game.result}</Text>
                </Text>
              </View>
            ))}
          </View>

          <TouchableOpacity onPress={() => setShowHistory(false)} style={styles.button}>
            <Text style={styles.buttonText}>Back</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  info: {
    fontSize: 16,
    textAlign: "center",
    marginVertical: 10,
  },
  button: {
    backgroundColor: "#333",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
  list: {
    marginBottom: 10,
  },
  gameItem: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 10,
  },
  black: {
    fontWeight: "bold",
    fontSize: 16,
  },
  value: {
    fontWeight: "normal",
  },
});

export default MyGames;
