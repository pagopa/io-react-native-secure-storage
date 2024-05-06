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

/**
 * ANDROID ONLY
 * Error codes returned by the Android module.
 */
type SecureStoragErrorCodesAndroid =
  | 'VALUE_NOT_FOUND'
  | 'GET_FAILED'
  | 'PUT_FAILED'
  | 'CLEAR_FAILED'
  | 'KEYS_RETRIEVAL_FAILED'
  | 'SECURE_STORE_NOT_INITIALIZED';

export type SecureStorageErrorCodes = SecureStoragErrorCodesAndroid;

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
 * Puts [data] in a file in [storageDirectory].
 * The content of the file might be manually encrypted is [useEncryption] is true, otherwise
 * it won't be encrypted to avoid double encryption if [storageDirectory] is already encrypted.
 * The [Builder] class also allows to disable or enable it manually, thus making double
 * encryption or no encryption at all possible. With the default behavior the content will
 * always be encrypted, automatically if [storageDirectory] is already encrypted or manually
 * otherwise.
 * Manual encryption uses AES-128 GCM with hardware backed key for each file in [storageDirectory]
 * Automatic encryption possibly uses [file-based encryption](https://source.android.com/docs/security/features/encryption/file-based)
 * thus AES-256 in XTS mode for file content and AES-256 in CBC-CTS mode for file names.
 * @param key the identifier of the file.
 * @param data the data to be written.
 * @return a promise that resolves when the data has been written or rejects with a [SecureStorageError] if an error occurs.
 */
export function put(key: string, data: string): Promise<void> {
  return IoReactNativeSecureStorage.put(key, data);
}

/**
 * Gets the content of the file associated with [key].
 * This function checks whether or not the file has been manually encrypted or not by parsing
 * the first [PREFIX_ENCRYPTED_SIZE] bytes and comparing it with a known set of values.
 * If the file has been manually encrypted then it calls the decryption function, otherwise
 * it just reads the content of the file. See [put] for more information about encryption.
 * The prefix is stripped in both cases.
 * @param key the identifier of the file.
 * @return a promise that resolves with the requested data or rejects with a [SecureStorageError] if an error occurs.
 */
export function get(key: string): Promise<string> {
  return IoReactNativeSecureStorage.get(key);
}

/**
 * Clears every stored file.
 */
export function clear(): Promise<void> {
  return IoReactNativeSecureStorage.clear();
}

/**
 * Removes the file associated with the given [key].
 * @param key the identifier of the file.
 * @return a promise that resolves or rejects with a [SecureStorageError] if an error occurs.
 */
export function remove(key: String): Promise<void> {
  return IoReactNativeSecureStorage.remove(key);
}

/**
 * Enumerates keys for each stored file.
 * @return a promise that resolves containing each file name UTF-8 encoded or rejects with a [SecureStorageError] if an error occurs.
 * @throws SecureStorageException when UTF-8 encoding is not supported.
 */
export function keys(): Promise<string[]> {
  return IoReactNativeSecureStorage.keys();
}
