import Foundation


/// Implements a secure storage based on iOS [Keychain services](https://developer.apple.com/documentation/security/keychain_services/)
public class SecureStorage {
  /// Creates a new instance of the ``SecureStorage`` class.
  /// - Parameter serviceName: value which concur as part of the primary key for each storage item. Groups the credentials stored from this instance.
  public init(serviceName: String) {
    self.serviceName = serviceName
  }
  
  /// The service name value groups the credentials stored in the keychain from the object of  ``SecureStorage``
  public var serviceName: String
  
  /// Puts a new value in the Keychain or overwrites it if a value already exists for the given `key`.
  /// `data` is stored as a `kSecClassGenericPassword` with  ``serviceName`` as `kSecAttrService`  and  `key` as `kSecAttrAccount`
  /// which are part of the primary key and thus must be unique.
  /// The accessibility policy is set to `kSecAttrAccessibleWhenUnlockedThisDeviceOnly`, thus the device must be unlocked to access `data`.
  /// - Parameters:
  ///   - key: the identifier of the data. Part of the primary key along with the provided `serviceName`.
  ///   - data: the data to be saved in the Keychain.
  /// - Throws: An error of type `SecureStorageError` if the operation fails which wraps the message and the error code.
  public func put(
    key: String,
    data: Data
  ) throws {
    var query: [String: Any] = [kSecClass: kSecClassGenericPassword, kSecAttrService: serviceName, kSecAttrAccount: key, kSecValueData: data, kSecAttrAccessible: kSecAttrAccessibleWhenUnlockedThisDeviceOnly] as [String: Any]
    var status = SecItemAdd(query as CFDictionary, nil)
    if status == errSecDuplicateItem { // We overwrite the duplicate
      let updated = [kSecValueData: query[kSecValueData as String] as! Data] as [String: Any]
      query = [kSecClass: kSecClassGenericPassword, kSecAttrService: serviceName, kSecAttrAccount: key] as [String: Any]
      status = SecItemUpdate(query as CFDictionary, updated as CFDictionary)
    }
    let statusMessage = SecCopyErrorMessageString(status, nil) as? String
    guard status == errSecSuccess else {
      throw SecureStorageError(description: statusMessage ?? "", code: Int(status))
    }
  }
  
  /// Gets a previously stored data.
  /// - Parameter key: the identifier of the data to be retrieved.
  /// - Returns: the data associated with `key`, `nil` if it can't be found.
  /// - Throws: An error of type `SecureStorageError` if the operation fails which wraps the message and the error code.
  public func get(
    key: String
  ) throws -> Data? {
    let query: [String: Any] = [
      kSecClass: kSecClassGenericPassword,
      kSecAttrService: serviceName,
      kSecReturnData: true,
      kSecAttrAccount: key
    ] as [String: Any]
    var result: CFTypeRef?
    let status = SecItemCopyMatching(query as CFDictionary, &result)
    if status == errSecItemNotFound {
        return nil
    }
    let statusMessage = SecCopyErrorMessageString(status, nil) as? String
    guard status == errSecSuccess else {
      throw SecureStorageError(description: statusMessage ?? "", code: Int(status))
    }
    return result as? Data
  }
  
  
  /// Removes a previously stored data.
  /// - Parameter key: the key of the data to be removed.
  /// - Throws: An error of type `SecureStorageError` if the operation fails which wraps the message and the error code.
  public func remove(
    key: String
  ) throws {
    let query: [String: Any] = [
      kSecClass: kSecClassGenericPassword,
      kSecAttrService: serviceName,
      kSecAttrAccount: key
    ] as [String: Any]
    let status = SecItemDelete(query as CFDictionary);
    let statusMessage = SecCopyErrorMessageString(status, nil) as? String
    guard status == errSecSuccess || status == errSecItemNotFound else { //Ignore the errSecItemNotFound when calling remove with an invalid key
      throw SecureStorageError(description: statusMessage ?? "", code: Int(status))
    }
  }
  
  
  /// Clears any value previsously stored.
  /// - Throws: An error of type `SecureStorageError` if the operation fails which wraps the message and the error code.
  public func clear() throws {
    let query: [String: Any] = [kSecClass: kSecClassGenericPassword, kSecAttrService: serviceName] as [String: Any]
    let status = SecItemDelete(query as CFDictionary);
    guard status == errSecSuccess || status == errSecItemNotFound else { //Ignore the errSecItemNotFound when calling clear on an empty keychain
      let statusMessage = SecCopyErrorMessageString(status, nil) as? String
      throw SecureStorageError(description: statusMessage ?? "", code: Int(status))
    }
  }
  
  /// Returns an array of the keys in the secure storage.
  /// - Returns: an array of strings containing the keys currently used to store data. An empty array if there isn't any key.
  /// - Throws: An error of type `SecureStorageError` if the operation fails which wraps the message and the error code.
  public func keys() throws -> [String] {
    let query: [String: Any] = [
      kSecClass: kSecClassGenericPassword,
      kSecAttrService: serviceName,
      kSecReturnRef: true,
      kSecReturnData: true,
      kSecReturnAttributes: true,
      kSecMatchLimit: kSecMatchLimitAll
    ] as [String: Any]
    var result: AnyObject?
    let status = SecItemCopyMatching(query as CFDictionary, &result)
    if status == errSecItemNotFound { return [] }
    guard status == errSecSuccess else {
      let statusMessage = SecCopyErrorMessageString(status, nil) as? String
      throw SecureStorageError(description: statusMessage ?? "", code: Int(status))
    }
    
    if let resultArray = result as? [[String: Any]] {
        return resultArray.compactMap { item in
            guard let account = item[kSecAttrAccount as String] as? String else {
                return nil // Skip if kSecAttrAccount is not a String
            }
            return account
        }
    }
    return []
  }
}
