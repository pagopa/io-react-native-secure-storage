@objc(IoReactNativeSecureStorage)
class IoReactNativeSecureStorage: NSObject {
  
  private typealias ME = ModuleException
  
  private let storage = SecureStorage(serviceName: "rn-secure-storage");
  
  let queue = DispatchQueue(label: "my.queue")
  
  /// See ``SecureStorage/put(key:data:)``
  /// `data` is encoded in UTF-8.
  @objc(put:withData:withResolver:withRejecter:)
  func put(key: String, data: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
    queue.async {
      do{
        guard let strData = data.data(using: .utf8) else {
          ME.putFailed.reject(reject: reject, ("error", "Error encoding data"))
          return
        }
        try self.storage.put(key: key, data: strData)
        resolve(nil)
      } catch let secureStorageErr as SecureStorageError {
        ME.putFailed.reject(reject: reject, ("error", secureStorageErr.description), ("code", secureStorageErr.code))
      }catch{
        ME.putFailed.reject(reject: reject, ("error", error.localizedDescription))
      }
    }
  }
  
  /// See ``SecureStorage/get()``
  /// Data received from the `get` function gets encoded in UTF-8.
  @objc(get:withResolver:withRejecter:)
  func get(key: String, resolve: @escaping RCTPromiseResolveBlock,reject: @escaping RCTPromiseRejectBlock) -> Void {
    queue.async {
      do{
        let data = try self.storage.get(key: key)
        guard let isData = data else {
          ME.valueNotFound.reject(reject: reject)
          return
        }
        guard let strData = String(data: isData, encoding: .utf8) else {
          ME.getFailed.reject(reject: reject, ("error", "Error encoding data"))
          return
        }
        resolve(strData)
      } catch let secureStorageErr as SecureStorageError {
        ME.getFailed.reject(reject: reject, ("error", secureStorageErr.description), ("code", secureStorageErr.code))
      }catch{
        ME.getFailed.reject(reject: reject, ("error", error.localizedDescription))
      }
    }
  }
  
  /// See ``SecureStorage/remove()``
  @objc(remove:withResolver:withRejecter:)
  func remove(key: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
    queue.async {
      do{
        try self.storage.remove(key: key)
        resolve(nil)
      }catch let secureStorageErr as SecureStorageError {
        ME.removeFailed.reject(reject: reject, ("error", secureStorageErr.description), ("code", secureStorageErr.code))
      }catch{
        ME.removeFailed.reject(reject: reject, ("error", error.localizedDescription))
      }
    }
  }
  
  /// See ``SecureStorage/clear()``
  @objc(clear:withRejecter:)
  func clear(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
    queue.async {
      do{
        try self.storage.clear()
        resolve(nil)
      }catch let secureStorageErr as SecureStorageError {
        ME.clearFailed.reject(reject: reject, ("error", secureStorageErr.description), ("code", secureStorageErr.code))
      }catch{
        ME.clearFailed.reject(reject: reject, ("error", error.localizedDescription))
      }
    }
  }
  
  /// See ``SecureStorage/keys()``
  @objc(keys:withRejecter:)
  func keys(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
    queue.async {
      do{
        let keys = try self.storage.keys()
        resolve(keys)
      }catch let secureStorageErr as SecureStorageError {
        ME.keysRetrivialError.reject(reject: reject, ("error", secureStorageErr.description), ("code", secureStorageErr.code))
      }catch{
        ME.putFailed.reject(reject: reject, ("error", error.localizedDescription))
      }
    }
  }
  
  
  private enum ModuleException: String, CaseIterable {
    case valueNotFound = "VALUE_NOT_FOUND"
    case getFailed = "GET_FAILED"
    case putFailed = "PUT_FAILED"
    case clearFailed = "CLEAR_FAILED"
    case removeFailed = "REMOVE_FAILED"
    case keysRetrivialError = "KEYS_RETRIEVAL_FAILED"
    case testException = "TEST_EXCEPTION"
    
    func error(userInfo: [String : Any]? = nil) -> NSError {
      switch self {
      case .valueNotFound:
        return NSError(domain: self.rawValue, code: -1, userInfo: userInfo)
      case .getFailed:
        return NSError(domain: self.rawValue, code: -1, userInfo: userInfo)
      case .putFailed:
        return NSError(domain: self.rawValue, code: -1, userInfo: userInfo)
      case .clearFailed:
        return NSError(domain: self.rawValue, code: -1, userInfo: userInfo)
      case .removeFailed:
        return NSError(domain: self.rawValue, code: -1, userInfo: userInfo)
      case .keysRetrivialError:
        return NSError(domain: self.rawValue, code: -1, userInfo: userInfo)
      case .testException:
        return NSError(domain: self.rawValue, code: -1, userInfo: userInfo)
      }
    }
    
    /// Rejects the provided promise with the appropriate error message and additional data.
    /// - Parameter reject  the promise to be rejected.
    /// - Parameter moreUserInfo additional key-value pairs of data to be passed along with the error.
    func reject(reject: RCTPromiseRejectBlock, _ moreUserInfo: (String, Any)...) {
      var userInfo = [String : Any]()
      moreUserInfo.forEach { userInfo[$0.0] = $0.1 }
      let error = error(userInfo: userInfo)
      reject("\(error.code)", error.domain, error)
    }
  }
}


