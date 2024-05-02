import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  Button,
  KeyboardAvoidingView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import * as SecureStorage from 'io-react-native-secure-storage';

const MARGIN = 20;

export default function App() {
  const [key, setKey] = React.useState<string | undefined>();
  const [value, setValue] = React.useState<string | undefined>();
  const [status, setStatus] = React.useState<string | undefined>();
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const put = async () => {
    if (key && value) {
      try {
        setIsLoading(true);
        await SecureStorage.put(key, value);
        setIsLoading(false);
        setStatus(`Value has been stored with key: ${key}`);
      } catch (e) {
        const error = e as SecureStorage.SecureStorageError;
        setIsLoading(false);
        setStatus(`Error: ${error.message}`);
        console.log(JSON.stringify(e));
      }
    } else {
      setStatus('Key and Value are required');
    }
  };

  const get = async () => {
    if (key) {
      try {
        setIsLoading(true);
        const result = await SecureStorage.get(key);
        setIsLoading(false);
        setStatus(`Recovered value: ${result}`);
      } catch (e) {
        const error = e as SecureStorage.SecureStorageError;
        setIsLoading(false);
        setStatus(`Error: ${error.message}`);
        console.log(JSON.stringify(e));
      }
    } else {
      setStatus('Key is required');
    }
  };

  const remove = async () => {
    if (key) {
      try {
        setIsLoading(true);
        await SecureStorage.remove(key);
        setIsLoading(false);
        setStatus(`Deleted value with key: ${key}`);
      } catch (e) {
        const error = e as SecureStorage.SecureStorageError;
        setIsLoading(false);
        setStatus(`Error: ${error.message}`);
        console.log(JSON.stringify(e));
      }
    } else {
      setStatus('Key is required');
    }
  };

  const clear = async () => {
    try {
      setIsLoading(true);
      await SecureStorage.clear();
      setIsLoading(false);
      setStatus('Cleared all values');
    } catch (e) {
      const error = e as SecureStorage.SecureStorageError;
      setIsLoading(false);
      setStatus(`Error: ${error.message}`);
      console.log(JSON.stringify(e));
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={[styles.title, styles.marginBottom]}>
          Secure Storage Example App
        </Text>
        <View>
          <Text>Key</Text>
          <TextInput
            style={[styles.input, styles.marginBottom]}
            onChange={(event) => setKey(event.nativeEvent.text)}
          />
        </View>
        <View>
          <Text>Value</Text>
          <TextInput
            value={value}
            style={[styles.input, styles.marginBottom]}
            onChange={(event) => setValue(event.nativeEvent.text)}
          />
        </View>

        <View style={[styles.buttons, styles.marginBottom]}>
          <Button title="Put" color="blue" onPress={() => put()} />

          <Button title="Get" color="blue" onPress={() => get()} />

          <Button title="Delete" color="blue" onPress={() => remove()} />

          <Button title="Clear" color="blue" onPress={() => clear()} />
        </View>

        <View style={styles.buttonsCenter}>
          <Button title="Get Keys" color="blue" />
        </View>

        {status && <Text>{status}</Text>}
        {isLoading && <ActivityIndicator />}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  marginBottom: {
    marginBottom: MARGIN,
  },
  row: {
    flexDirection: 'row',
  },
  center: {
    alignSelf: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  content: {
    marginHorizontal: MARGIN,
  },
  title: {
    fontSize: 28,
    fontWeight: '200',
    textAlign: 'center',
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    height: 32,
    fontSize: 14,
    padding: 8,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buttonsCenter: {
    justifyContent: 'center',
  },
});
