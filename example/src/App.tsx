import React, { useCallback } from 'react';
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
import CheckBox from '@react-native-community/checkbox';

const MARGIN = 20;

const MAX_VALUE_LENGTH = 1000;

const COLOR = 'blue';

const BIG_VALUE = 'x'.repeat(2 * 1024 * 1024);

export default function App() {
  const [key, setKey] = React.useState<string | undefined>();
  const [value, setValue] = React.useState<string | undefined>();
  const [status, setStatus] = React.useState<string | undefined>();
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [forceEncryption, setForceEncryption] = React.useState<boolean>(false);

  const RenderAndroidHeader = useCallback(
    () => (
      <View style={styles.marginBottom}>
        <View style={styles.checkbox}>
          <Text>Force manual encryption</Text>
          <CheckBox
            value={forceEncryption}
            onValueChange={async (newValue) => {
              setForceEncryption(newValue);
              await SecureStorage.setEnforceManualEncryption(newValue);
            }}
            tintColors={{ true: COLOR, false: COLOR }}
          />
        </View>
        <Text>
          Note: Manual encryption can be set only before the first operation.
          Restart the app otherwise.
        </Text>
      </View>
    ),
    [forceEncryption]
  );

  const put = async () => {
    if (key && value) {
      try {
        setIsLoading(true);
        await SecureStorage.put(key, value);
        setStatus(`Value has been stored with key: ${key}`);
      } catch (e) {
        const error = e as SecureStorage.SecureStorageError;
        setStatus(`Error: ${error.message}`);
        console.log(JSON.stringify(e));
      } finally {
        setIsLoading(false);
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
        if (result.length > MAX_VALUE_LENGTH) {
          setStatus(
            `Recovered value (sliced): ${result.slice(0, MAX_VALUE_LENGTH)}...`
          );
        } else {
          setStatus(`Recovered value: ${result}`);
        }
        console.log(JSON.stringify(result));
      } catch (e) {
        const error = e as SecureStorage.SecureStorageError;
        setStatus(`Error: ${error.message}`);
        console.log(JSON.stringify(e));
      } finally {
        setIsLoading(false);
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
        setStatus(`Deleted value with key: ${key}`);
      } catch (e) {
        const error = e as SecureStorage.SecureStorageError;
        setStatus(`Error: ${error.message}`);
        console.log(JSON.stringify(e));
      } finally {
        setIsLoading(false);
      }
    } else {
      setStatus('Key is required');
    }
  };

  const clear = async () => {
    try {
      setIsLoading(true);
      await SecureStorage.clear();
      setStatus('Cleared all values');
    } catch (e) {
      const error = e as SecureStorage.SecureStorageError;
      setStatus(`Error: ${error.message}`);
      console.log(JSON.stringify(e));
    } finally {
      setIsLoading(false);
    }
  };

  const keys = async () => {
    try {
      setIsLoading(true);
      const res = await SecureStorage.keys();
      setStatus(`Keys: ${res}`);
    } catch (e) {
      const error = e as SecureStorage.SecureStorageError;
      setStatus(`Error: ${error.message}`);
      console.log(JSON.stringify(e));
    } finally {
      setIsLoading(false);
    }
  };

  const tests = async () => {
    try {
      setIsLoading(true);
      await SecureStorage.tests();
    } catch (e) {
      const error = e as SecureStorage.SecureStorageError;
      setStatus(`Error: ${error.message}`);
      console.log(JSON.stringify(e));
    } finally {
      setIsLoading(false);
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
        {Platform.OS === 'android' && <RenderAndroidHeader />}
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
          <Button title="Put" color={COLOR} onPress={() => put()} />

          <Button title="Get" color={COLOR} onPress={() => get()} />

          <Button title="Delete" color={COLOR} onPress={() => remove()} />

          <Button title="Clear" color={COLOR} onPress={() => clear()} />

          <Button title="Get Keys" color={COLOR} onPress={() => keys()} />
        </View>

        <View style={styles.marginBottom}>
          <Button
            title="Set 2MiB Value"
            color={COLOR}
            onPress={() => setValue(BIG_VALUE)}
          />
        </View>

        <View style={[styles.marginBottom]}>
          <Button title="Run Tests" color={COLOR} onPress={() => tests()} />
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
  checkbox: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
