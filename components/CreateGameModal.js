import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { ethers } from 'ethers';
import TicTacToeFactoryABI from './contracts/TicTacToeFactory.json';

const CreateGameModal = ({ onClose, provider, account, tictactoeFactoryAddress }) => {
  const [stake, setStake] = useState('');

  const handleSubmit = async () => {
    if (!provider || !account) {
      Alert.alert("Error", "Wallet is not connected.");
      return;
    }

    try {
      // Kreiranje instance contracta
      const signer = provider.getSigner();
      const tictactoeFactory = new ethers.Contract(
        tictactoeFactoryAddress,
        TicTacToeFactoryABI.abi,
        signer
      );

      // Pretvaranje stake u wei
      const valueInWei = ethers.utils.parseEther(stake);

      // Slanje transakcije
      const tx = await tictactoeFactory.createGame({ value: valueInWei });
      console.log('Transaction sent:', tx.hash);

      await tx.wait();
      console.log('Transaction confirmed:', tx.hash);

      onClose();
    } catch (error) {
      console.error("Transaction error:", error);
      Alert.alert("Transaction Error", error.message || "Something went wrong!");
    }
  };

  return (
    <View style={styles.modalContainer}>
      <Text style={styles.title}>Set your stake:</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        placeholder="Enter ETH amount"
        value={stake}
        onChangeText={setStake}
      />
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
        <Text style={styles.buttonText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 5,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    marginBottom: 15,
  },
  input: {
    width: '80%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  button: {
    width: '80%',
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 5,
  },
  cancelButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default CreateGameModal;
