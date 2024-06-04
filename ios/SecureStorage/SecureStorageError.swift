import Foundation

/// Custom exception wrapper for errors raised in ``SecureStorage``.
public struct SecureStorageError: LocalizedError {
  
  var description: String
  var code: Int
  
  init(
    description: String,
    code: Int = 0
  ) {
    self.description = description
    self.code = code
  }
  
  public var errorDescription: String? {
    return description
  }
}
