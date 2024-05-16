import { NativeModules, Platform } from 'react-native';

const LINKING_ERROR =
  `The package 'io-react-native-secure-storage' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

const IoReactNativeSecureStorage = NativeModules.IoReactNativeSecureStorage
  ? NativeModules.IoReactNativeSecureStorage
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

type SecureStorageErrorCodesCommon =
  | 'VALUE_NOT_FOUND'
  | 'GET_FAILED'
  | 'PUT_FAILED'
  | 'CLEAR_FAILED'
  | 'REMOVE_FAILED'
  | 'KEYS_RETRIEVAL_FAILED';

/**
 * ANDROID ONLY
 * Error codes returned by the Android module.
 */
type SecureStoragErrorCodesAndroid =
  | 'SECURE_STORE_NOT_INITIALIZED'
  | 'TEST_EXCEPTION';

export type SecureStorageErrorCodes =
  | SecureStorageErrorCodesCommon
  | SecureStoragErrorCodesAndroid;

/**
 * Error type returned by a rejected promise.
 *
 * If additional error information are available,
 * they are stored in the {@link SecureStorageError["userInfo"]} field.
 */
export type SecureStorageError = {
  message: SecureStorageErrorCodes;
  userInfo: Record<string, string>;
};

/**
 * ANDROID ONLY
 * Enforces manual encryption. By default, the builder takes care of
 * using an appropriate useEncryption value according to the
 * provided storageDirectory which might be already encrypted on most devices.
 * This has to be called before the very first operation, otherwise it won't have any effect.
 * @param isEnforced true to enforce manual encryption, false otherwise.
 * @return a promise that resolves.
 */
export function setEnforceManualEncryption(isEnforced: boolean): Promise<void> {
  return IoReactNativeSecureStorage.setEnforceManualEncryption(isEnforced);
}

/**
 * Puts the specified value mapped to the specified key in the secure storage.
 * @param key the identifier of the data.
 * @param data the data to be written.
 * @return a promise that resolves when the data has been written or rejects with a [SecureStorageError] if an error occurs.
 * @throws {@link SecureStorageException} if an error occurs while storing the data.
 */
export function put(key: string, data: string): Promise<void> {
  return IoReactNativeSecureStorage.put(key, data);
}

/**
 * Gets the value to which the key is mapped in the secure storage.
 * @param key the identifier of the data.
 * @return a promise that resolves with the requested data or rejects with a [SecureStorageError] if an error occurs.
 * @throws {@link SecureStorageException} if an error occurs while getting the data or if there's no data associated with the given key.
 */
export function get(key: string): Promise<string> {
  return IoReactNativeSecureStorage.get(key);
}

/**
 * Clears every key and the corresponding data from the secure storage.
 * @throws {@link SecureStorageException} if an error occurs while clearing the storage.
 */
export function clear(): Promise<void> {
  return IoReactNativeSecureStorage.clear();
}

/**
 * Removes the key and its corresponding data from the secure storage.
 * @param key the identifier of the data.
 * @return a promise that resolves or rejects with a [SecureStorageError] if an error occurs.
 * @throws {@link SecureStorageException} if an error occurs while removing the data or if there's no data associated with the given key.
 */
export function remove(key: String): Promise<void> {
  return IoReactNativeSecureStorage.remove(key);
}

/**
 * Enumarates the keys in the secure storage.
 * @return a promise that resolves containing each file name UTF-8 encoded or rejects with a [SecureStorageError] if an error occurs.
 * @throws SecureStorageException when UTF-8 encoding is not supported.
 * @throws {@link SecureStorageException} if an error occurs while removing the data or if there's no data associated with the given key.
 */
export function keys(): Promise<string[]> {
  return IoReactNativeSecureStorage.keys();
}

/**
 * ANDROID ONLY
 * Runs a test routine to check if the module is working correctly.
 * @throws {@link SecureStorageException} if an error occurs during the test routine. Additional information about the failed test
 * can be found in the exception's message.
 */
export function tests(): Promise<void> {
  return IoReactNativeSecureStorage.tests();
}
