import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { ethers } from 'ethers';
import TicTacToeFactoryABI from './contracts/TicTacToeFactory.json';
import TicTacToeGameABI from './contracts/TicTacToeGame.json';
import GameBoard from './GameBoard';

const GameList = ({ provider, signerProvider, account, tictactoeFactoryAddress }) => {
  const [games, setGames] = useState([]);
  const [showGameBoard, setShowGameBoard] = useState(false);
  const [selectedGameAddress, setSelectedGameAddress] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadGames = async () => {
      if (!provider || !account) {
        setGames([]);
        return;
      }

      setIsLoading(true);
      try {
        const factory = new ethers.Contract(
          tictactoeFactoryAddress,
          TicTacToeFactoryABI.abi,
          provider
        );

        const gameAddresses = await factory.getAllGames();

        const gameData = await Promise.all(
          gameAddresses.map(async (address) => {
            const game = new ethers.Contract(address, TicTacToeGameABI.abi, provider);
            const player1 = await game.player1();
            const player2 = await game.player2();
            const stake = await game.stake();
            const status = await game.status();

            return {
              address,
              player1,
              player2,
              stake: ethers.utils.formatEther(stake),
              status: status.toString(),
            };
          })
        );

        const userAddress = account?.toLowerCase();
        if (!userAddress) {
          setGames([]);
          return;
        }

        const activeGames = gameData.filter((game) => {
          const isWaiting = game.status === '0';
          const isInProgress = game.status === '1';

          if (isWaiting) return true;
          if (isInProgress) {
            const isPlayer1 = game.player1?.toLowerCase() === userAddress;
            const isPlayer2 = game.player2?.toLowerCase() === userAddress;
            return isPlayer1 || isPlayer2;
          }
          return false;
        });

        setGames(activeGames);
      } catch (err) {
        console.error("Failed to load games:", err);
        Alert.alert("Error", "Failed to load games.");
        setGames([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadGames();
  }, [provider, account, tictactoeFactoryAddress]);

  const joinGame = async (gameAddress, stake) => {
    if (!signerProvider || !account) {
      Alert.alert("Error", "Wallet is not connected.");
      return;
    }

    try {
      const signer = signerProvider.getSigner();
      const gameContract = new ethers.Contract(gameAddress, TicTacToeGameABI.abi, signer);
      const valueInWei = ethers.utils.parseEther(stake);

      const tx = await gameContract.joinGame({ value: valueInWei });
      console.log('Transaction sent:', tx.hash);
      await tx.wait();
      console.log('Transaction confirmed:', tx.hash);

      setSelectedGameAddress(gameAddress);
      setShowGameBoard(true);
    } catch (error) {
      console.error("Error joining game:", error);
      Alert.alert("Error joining game", error.message || "Something went wrong!");
    }
  };

  const renderGameItem = ({ item }) => {
    if (!account) return null;

    const isUserPlayer1 = item.player1?.toLowerCase() === account.toLowerCase();
    const isUserPlayer2 = item.player2?.toLowerCase() === account.toLowerCase();
    const isUserInGame = isUserPlayer1 || isUserPlayer2;
    const isSelected = selectedGameAddress === item.address;

    return (
      <View style={styles.gameItem}>
        {isSelected && showGameBoard ? (
          <View>
            <GameBoard
              gameAddress={item.address}
              provider={provider}          // za čitanje
              signerProvider={signerProvider} // za pisanje
              account={account}
              onClose={() => {
                setSelectedGameAddress(null);
                setShowGameBoard(false);
              }}
            />
            <TouchableOpacity
              style={[styles.button, styles.closeButton]}
              onPress={() => {
                setShowGameBoard(false);
                setSelectedGameAddress(null);
              }}
            >
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.gameInfo}>
            <Text><Text style={styles.bold}>Stake:</Text> {item.stake} ETH</Text>

            {item.status === '0' ? (
              isUserPlayer1 ? (
                <Text style={styles.yourGameLabel}>| YOUR GAME</Text>
              ) : (
                <TouchableOpacity
                  style={[styles.button, styles.joinButton]}
                  onPress={() => joinGame(item.address, item.stake)}
                >
                  <Text style={styles.buttonText}>Join</Text>
                </TouchableOpacity>
              )
            ) : item.status === '1' && isUserInGame ? (
              <TouchableOpacity
                style={[styles.button, styles.playButton]}
                onPress={() => {
                  setSelectedGameAddress(item.address);
                  setShowGameBoard(true);
                }}
              >
                <Text style={styles.buttonText}>Play</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Available Games:</Text>
      {isLoading ? (
        <Text style={styles.loading}>Loading games...</Text>
      ) : games.length === 0 ? (
        <Text>No games found.</Text>
      ) : (
            <View>
              <FlatList
                data={games}
                keyExtractor={(item) => item.address}
                renderItem={renderGameItem}
                style={styles.list}
              />
            </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 15 },
  title: { fontSize: 20, marginBottom: 10, fontWeight: 'bold', alignContent: 'center', margin: 'auto' },
  list: { marginTop: 10 },
  gameItem: { marginBottom: 15, padding: 10, backgroundColor: '#f1f1f1', borderRadius: 8 },
  gameInfo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  bold: { fontWeight: 'bold' },
  yourGameLabel: { color: '#4CAF50', fontWeight: 'bold' },
  button: { padding: 10, borderRadius: 5, alignItems: 'center', minWidth: 80 },
  joinButton: { backgroundColor: '#2196F3' },
  playButton: { backgroundColor: '#4CAF50' },
  closeButton: { backgroundColor: '#f44336', marginTop: 10 },
  buttonText: { color: '#fff' },
  loading: { margin: 'auto' },
});

export default GameList;
