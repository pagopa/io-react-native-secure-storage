import XCTest
import io_react_native_secure_storage

// Tests which can be run on a simulator or pyshical device
final class SecureStorageTests: XCTestCase {
  
  let ss = SecureStorage(serviceName: "rn-test")
  
  let key = "test"
  
  let smallData = "data".data(using: .utf8)!
  
  let largeData = String((0..<2*1024*1024).map{ _ in "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".randomElement()! }).data(using: .utf8)!
  
  override func setUpWithError() throws {
    try ss.clear()
  }
  
  override func tearDownWithError() throws {
    // Put teardown code here. This method is called after the invocation of each test method in the class.
  }
  
  func testPut() throws {
    try ss.put(key: key, data: smallData)
  }
  
  func testGet() throws {
    try ss.put(key: key, data: smallData)
    let getResult = try ss.get(key: key)
    XCTAssertEqual(getResult, smallData)
  }
  
  func testEmptyGet() throws {
    let empty = try ss.get(key: key)
    XCTAssertNil(empty)
  }
  
  func testLargePut() throws {
    try ss.put(key: key, data: largeData)
  }
  
  func testLargeGet() throws {
    try ss.put(key: key, data: largeData)
    try ss.put(key: key, data: largeData)
  }
  
  func testRemove() throws {
    try ss.put(key: key, data: smallData)
    try ss.remove(key: key)
    XCTAssertNil(try ss.get(key: key))
  }
  
  func testKeys() throws {
    try ss.put(key: key, data: smallData)
    try ss.put(key: "test2", data: smallData)
    var keys = try ss.keys()
    XCTAssertEqual(keys, [key, "test2"])
    try ss.clear()
    keys = try ss.keys()
    XCTAssertEqual(keys, [])
  }
  
}
