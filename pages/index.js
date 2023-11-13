import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { persistStore } from 'redux-persist';
import { ChakraProvider } from '@chakra-ui/react';
import io     from '../src/lib/fileIO';
import Head   from 'next/head';
import App    from '/src/components/App';
import styles from '/styles/Home.module.css';
import store  from '/src/store';

let persistor = persistStore(store);

export default function Home() {
  const handlePurgeData = () => {
    console.log("Purging data");
    persistor.purge();
    window.location.reload();
  };

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ChakraProvider>
          <Head>
            <title>Minddrop</title>
            <meta
              name="description"
              content="Discover, direct, drop your mind."
            />
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1"
            />
            <link rel="icon" href="/favicon.ico" />
          </Head>
          <main className={styles.main}>
            <App />
          </main>

          {/* These are debug Controls. Delete later! */}
          
          <footer className={styles.debugBox}>
            <button onClick={handlePurgeData}>Delete Data</button>
            <button onClick={() => {
              console.log('store:', store.getState());
              const dropData = store.getState().drops;
              io.saveToDisk(JSON.stringify(dropData), 'drops', 'text/plain');
            }}>Save Data</button>
          </footer>
        </ChakraProvider>
      </PersistGate>
    </Provider>
  );
}
