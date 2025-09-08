import { StyleSheet, Text, View, Pressable, ScrollView, Modal, Image } from 'react-native';
import { WalletConnectModal, useWalletConnectModal } from '@walletconnect/modal-react-native';
import { ethers } from 'ethers';
import { useEffect, useMemo } from 'react';

import GameList from './components/GameList';
import MyGames from './components/MyGames';
import CreateGameModal from './components/CreateGameModal';
import { useState } from 'react';

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
  const [showCreateGameModal, setShowCreateGameModal] = useState(false);
  const [showRestOfApp, setShowRestOfApp] = useState(false);

  useEffect(() => {
    if (provider) {
      provider.disconnect(); // briše prethodnu sesiju (trebalo bi barem)
    }
  }, []);

  // Signer provider (za transakcije)
  const signerProvider = useMemo(() => {
    if (!provider) return null;
    return new ethers.providers.Web3Provider(provider);
  }, [provider]);

  // RPC provider (uvek stabilan za čitanje podataka)
  const rpcProvider = useMemo(() => {
    return new ethers.providers.JsonRpcProvider(
      'https://sepolia.infura.io/v3/8e51829c693a42819c27393d4e0ff583'
    );
  }, []);

  const handleButtonPress = async () => {
    if (isConnected) {
      return provider?.disconnect();
    }
    return open();
  };

  useEffect(() => {
    if (provider && isConnected) {
      console.log('Wallet connected successfully');
    }
  }, [provider, isConnected]);


  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>TicTacToe Mobile DApp</Text>
      <Text style={styles.text}>{isConnected ? `CONNECTED: ${address}` : 'No wallet connected'}</Text>
      <Pressable onPress={handleButtonPress} style={styles.pressableMargin}>
        <Text style={styles.buttonText}>{isConnected ? 'DISCONNECT' : 'CONNECT'}</Text>
      </Pressable>

      {!isConnected && (
        <View style={styles.container}>
          <Image source={require('./assets/TicTacToe.png')} style={styles.image} />
        </View>)}

      {isConnected && (
        <GameList
          provider={rpcProvider}
          signerProvider={signerProvider}
          account={address}
          tictactoeFactoryAddress={tictactoeFactoryAddress}
        />
      )}

      {isConnected && (
        <>
          <Text style={styles.titleNewGame}>Create A New Game</Text>
          <Pressable onPress={() => setShowCreateGameModal(true)} style={styles.buttonNewGame}>
            <Text style={styles.buttonText}>NEW GAME</Text>
          </Pressable>
        </>)}
      {showCreateGameModal && (
        <Modal
          animationType="fade"
          transparent={true}
          visible={showCreateGameModal}
          onRequestClose={() => setShowCreateGameModal(false)}
        >
          <View style={styles.overlay}>
            <CreateGameModal
              provider={signerProvider}
              account={address}
              tictactoeFactoryAddress={tictactoeFactoryAddress}
              onClose={() => setShowCreateGameModal(false)}
            />
          </View>
        </Modal>
      )}

      {isConnected && (
        <MyGames
          provider={rpcProvider}
          account={address}
          tictactoeFactoryAddress={tictactoeFactoryAddress}
        />
      )}

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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 30,
    marginBottom: 60,
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  pressableMargin: {
    margin: 'auto',
    width: '60%',
    alignItems: 'center',
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
  buttonNewGame: {
    margin: 'auto',
    width: '60%',
    alignItems: 'center',
    marginTop: 16,
    backgroundColor: '#c41fe2',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  titleNewGame: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  text: {
    margin: 'auto',
    alignItems: 'center',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 300,
    height: 300,
    alignItems: 'center',
    resizeMode: 'contain',
    marginTop: 20,
  },
});
