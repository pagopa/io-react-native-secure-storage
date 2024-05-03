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

export default function App() {
  const [key, setKey] = React.useState<string | undefined>();
  const [value, setValue] = React.useState<string | undefined>();
  const [status, setStatus] = React.useState<string | undefined>();
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [disableStrongBox, setDisableStrongBox] =
    React.useState<boolean>(false);
  const [forceEncryption, setForceEncryption] = React.useState<boolean>(false);

  const RenderAndroidHeader = useCallback(
    () => (
      <View style={styles.marginBottom}>
        <View style={styles.checkbox}>
          <Text>Disable StrongBox</Text>
          <CheckBox
            value={disableStrongBox}
            onValueChange={async (newValue) => {
              setDisableStrongBox(newValue);
              await SecureStorage.setUseStrongBox(newValue);
            }}
            tintColors={{ true: COLOR, false: COLOR }}
          />
        </View>
        <Text>
          Note: StrongBox can be disabled only before the first operation. If
          automatic encyrption is used then the value will be ignored.
        </Text>
        <View style={styles.checkbox}>
          <Text>Force manual encryption</Text>
          <CheckBox
            value={forceEncryption}
            onValueChange={async (newValue) => {
              setForceEncryption(newValue);
              await SecureStorage.setUseEncryption(newValue);
            }}
            tintColors={{ true: COLOR, false: COLOR }}
          />
        </View>
        <Text>
          Note: Manual encryption can be set only before the first operation.
        </Text>
      </View>
    ),
    [disableStrongBox, forceEncryption]
  );

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

  const keys = async () => {
    try {
      setIsLoading(true);
      const res = await SecureStorage.keys();
      setIsLoading(false);
      setStatus(`Keys: ${res}`);
    } catch (e) {
      const error = e as SecureStorage.SecureStorageError;
      setIsLoading(false);
      setStatus(`Error: ${error.message}`);
      console.log(JSON.stringify(e));
    }
  };

  const setBigValue = () => {
    setValue('x'.repeat(2 * 1024 * 1024));
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
            onPress={() => setBigValue()}
          />
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
