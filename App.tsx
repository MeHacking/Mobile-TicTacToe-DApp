import { StyleSheet, Text, View, Pressable } from 'react-native';
import { WalletConnectModal, useWalletConnectModal } from '@walletconnect/modal-react-native';

import MyGames from './components/MyGames';
import CreateGameModal from './components/CreateGameModal';
import GameBoard from './components/GameBoard';
import GameList from './components/GameList';
import { ethers } from 'ethers';
import { useEffect } from 'react';

const projectId = 'c79c9f7f677758f070b5468dcf16fdef';
const tictactoeFactoryAddress = "0x5130c51655CEA7120C5D9DcD70B41B11228961B7";

const providerMetadata = {
  name: 'TicTacToe Mobile DApp',
  description: 'A simple TicTacToe game with stakes on blockchain',
  url: 'https://tictactoe-game.com',
  icons: ['https://avatars.githubusercontent.com/u/37784886'],
  redirect: {
    native: 'exp://',
    universal: 'https://tictactoe-game.com',
  }, 
};

export default function App() {
  const { open, isConnected, address, provider } = useWalletConnectModal();

  const ethersProvider = provider ? new ethers.providers.Web3Provider(provider) : null;
  //const ethersProvider = new ethers.providers.JsonRpcProvider('https://sepolia.infura.io/v3/8e51829c693a42819c27393d4e0ff583');
  
  const handleButtonPress = async () => {
    if (isConnected) {
      return provider?.disconnect();
    }
    return open();
  }

 useEffect(() => {
    if (provider && isConnected) {
      console.log('Wallet connected successfully');
    }
  }, [provider, isConnected]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Welcome to TicTacToe Mobile DApp!</Text>
      <Text>{isConnected ? `Connected: ${address}` : 'No wallet connected'}</Text>
      <Pressable onPress={handleButtonPress} style={styles.pressableMargin}>
        <Text style={styles.buttonText}>{isConnected ? 'DISCONNECT' : 'CONNECT'}</Text>
      </Pressable>
      <GameList provider={ethersProvider} account={address} tictactoeFactoryAddress={tictactoeFactoryAddress}/>
      <WalletConnectModal
  explorerRecommendedWalletIds={[
    'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96',
  ]}
  explorerExcludedWalletIds="ALL"
  projectId={projectId}
  providerMetadata={providerMetadata}
  sessionParams={{
    namespaces: {
      eip155: {
        methods: [
          'eth_sendTransaction',
          'eth_signTransaction',
          'eth_sign',
          'personal_sign',
          'eth_signTypedData',
        ],
        chains: ['eip155:11155111'], // Sepolia testnet
        events: ['chainChanged', 'accountsChanged'],
        rpcMap: {
          11155111: 'https://sepolia.infura.io/v3/8e51829c693a42819c27393d4e0ff583',
        },
      },
    },
  }}
/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  pressableMargin: {
    marginTop: 16,
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
