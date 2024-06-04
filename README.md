# io-react-native-secure-storage

React Native interfaces for managing secure storage in iOS and Android.

## Installation

```sh
npm install io-react-native-secure-storage
# or
yarn add io-react-native-secure-storage
```

## Android

The Android implementation has two operating modes: automatic and manual encryption. The library takes care of selecting the appropriate mode based on the provided directory where the files will be stored. In this `react-native` implementation the path equals to the directory holding application files. If the path is already encrypted by default then manual encryption is disabled, otherwise it enables it. Enabling it manually via `setEnforceManualEncryption` might results in a double encrypted file.
Manual encryption is handled in chunks with a **AES/GCM/NoPadding** cipher. Chunks are required due to a bug in the keystore implementation on some devices which breaks the encryption on large files. The key used to encrypt is hardware-backed, accessible only when the device is unlocked and uses StrongBox when available.
Automatic encryption uses Android file-based encryption which encrypts the file content with AES-256 in XTS mode for file content and AES-256 in CBC-CTS mode for file names.
Instead of managing raw bytes array, the bridge handles UTF-8 encoded strings for put and get methods.

**Note:** Apps that target Android 6.0 (API level 23) or higher automatically participate in Auto Backup. This backup includes the directory holding application files. However, in case of manual encryption, the key used to encrypt is not backed up and this results in a loss of data when the app is restored. To prevent this, autobackup can be disabled by setting `android:allowBackup="false"` in the `AndroidManifest.xml` file:

```xml
<manifest ... >
    ...
    <application android:allowBackup="false" ... >
        ...
    </application>
</manifest>
```

## iOS

The iOS implementation is based on the [Keychain service](https://developer.apple.com/documentation/security/keychain_services/).
Entries are stored as [kSecClassGenericPassword](https://developer.apple.com/documentation/security/ksecclassgenericpassword) with [kSecAttrAccessibleWhenUnlockedThisDeviceOnly](https://developer.apple.com/documentation/security/ksecattraccessiblewhenunlockedthisdeviceonly) attribute which makes them accessible only while the device is unlocked.

## API

### `put`

Stores a string value in the storage with the given key.

```ts
try {
  const key = 'key';
  const value = 'value';
  await SecureStorage.put(key, value);
} catch (e) {
  const error = e as SecureStorage.SecureStorageError;
  setStatus(`Error: ${error.message}`);
  console.log(JSON.stringify(e));
}
```

### `get`

Retrieves the value with the given key from the storage. If the key does not exist, the method will throw an error.

```ts
try {
  const key = 'key';
  const value = await SecureStorage.get(key, value);
  console.log(value); // 'value'
} catch (e) {
  const error = e as SecureStorage.SecureStorageError;
  setStatus(`Error: ${error.message}`);
  console.log(JSON.stringify(e));
}
```

### `remove`

Removes the value with the given key from the storage.

```ts
try {
  const key = 'key';
  await SecureStorage.remove(key, value);
} catch (e) {
  const error = e as SecureStorage.SecureStorageError;
  setStatus(`Error: ${error.message}`);
  console.log(JSON.stringify(e));
}
```

### `clear`

Deletes all keys and values from the storage.

```ts
try {
  await SecureStorage.clear();
} catch (e) {
  const error = e as SecureStorage.SecureStorageError;
  setStatus(`Error: ${error.message}`);
  console.log(JSON.stringify(e));
}
```

### `keys`

Returns an array of all keys in the storage.

```ts
try {
  const keys = await SecureStorage.keys();
  console.log(keys);
} catch (e) {
  const error = e as SecureStorage.SecureStorageError;
  setStatus(`Error: ${error.message}`);
  console.log(JSON.stringify(e));
}
```

### `setEnforceManualEncryption` (Android Only)

This method enables manual encryption on Android. It should be called before any other method. If the directory holding application files is already encrypted by default, then manual encryption is disabled. Enabling it manually results in a double encrypted file.

```ts
try {
  await SecureStorage.setEnforceManualEncryption();
  [...]
} catch (e) {
  const error = e as SecureStorage.SecureStorageError;
  setStatus(`Error: ${error.message}`);
  console.log(JSON.stringify(e));
}
```

### `tests` (Android Only)

This method runs a test suite on Android to check if the library is working correctly. `SecuraStorageInstrumentedTest.kt` already contains an instrumented test suite which can be run through Android Studio. However, this method is useful for running tests from the JavaScript side.

```ts
try {
  await SecureStorage.tests();
  console.log('Tests passed');
} catch (e) {
  const error = e as SecureStorage.SecureStorageError;
  setStatus(`Error: ${error.message}`);
  console.log(JSON.stringify(e));
}
```

## Types

|      TypeName      | Description                                                                                                                       |
| :----------------: | --------------------------------------------------------------------------------------------------------------------------------- |
| SecureStorageError | This type defines the error returned by the secure storage engine and includes an error code and an additional information object |

## Error Codes

|           TypeName           |   Platform   | Description                                                             |
| :--------------------------: | :----------: | ----------------------------------------------------------------------- |
|       VALUE_NOT_FOUND        | iOS/Android  | No value has been found with the given key                              |
|          GET_FAILED          | iOS/Android  | A critical error occurred during the get operation                      |
|          PUT_FAILED          | iOS/Android  | A critical error occurred during the put operation                      |
|         CLEAR_FAILED         | iOS/Android  | A critical error occurred during the clear operation                    |
|        REMOVE_FAILED         | iOS/Android  | A critical error occurred during the remove operation                   |
|    KEYS_RETRIEVAL_FAILED     | iOS/Android  | A critical error occurred during the keys operation                     |
| SECURE_STORE_NOT_INITIALIZED |   Android    | A critical error occurred while initializaing the secure storage engine |
|        TEST_EXCEPTION        |   Android    | A critical error occurred while running the test suite                  |
|    PLATFORM_NOT_SUPPORTED    | Any platform | The platform is not supported by the library                            |

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
