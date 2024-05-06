package com.ioreactnativesecurestorage

import com.facebook.react.bridge.ReactApplicationContext
import com.pagopa.securestorage.SecureStorage
import java.io.File
import kotlin.random.Random

/**
 * This class contains the very same tests as [SecureSTorageInstrumentedTest] which can be
 * called directly from the react-native bridge.
 */
class IoReactNativeSecureStorageTests(reactContext: ReactApplicationContext) {
  private val storageDir: File =
    File(reactContext.applicationContext.filesDir, "instrumental-testing")
  private val context = reactContext.applicationContext

  /**
   * Tests a put and get method with automatic encryption.
   */
  fun testAutomaticEncryption() {
    try {
      val storage = SecureStorage.Builder(context, storageDir).build()
      val value = byteArrayOf(1, 2, 3)
      storage.put("test", value)
      if (!(value.contentEquals(storage.get("test")))) throw IllegalStateException("Stored value is not equal to retrieved one")
    } catch (e: Exception) {
      throw IllegalStateException("testAutomaticEncryption failed ${e.message}", e)
    }
  }

  /**
   * Tests a put and get method with large data and automatic encryption.
   */
  fun testAutomaticEncryptionLarge() {
    try {
      val storage: SecureStorage = SecureStorage.Builder(context, storageDir).build()
      storage.clear()
      val data = ByteArray(2 * 1024 * 1024)
      Random.nextBytes(data, 0, data.size - 1)
      storage.put("test", data)
      if (!(data.contentEquals(storage.get("test")))) throw IllegalStateException("Stored value is not equal to retrieved one")
    } catch (e: Exception) {
      throw IllegalStateException("testAutomaticEncryptionLarge failed ${e.message}", e)
    }
  }

  /**
   * Tests a put and get method with manual encryption.
   */
  fun testManualEncryption() {
    try {
      val storage =
        SecureStorage.Builder(context, storageDir).setEnforceManualEncryption(true).build()
      val value = byteArrayOf(1, 2, 3)
      storage.put("test", value)
      if (!(value.contentEquals(storage.get("test")))) throw IllegalStateException("Stored value is not equal to retrieved one")
    } catch (e: Exception) {
      throw IllegalStateException("testManualEncryption failed ${e.message}", e)
    }
  }

  /**
   * Tests a put and get method with large data and manual encryption.
   */
  fun testManualEncryptionLarge() {
    try {
      val storage: SecureStorage =
        SecureStorage.Builder(context, storageDir).setEnforceManualEncryption(true).build()
      storage.clear()
      val data = ByteArray(2 * 1024 * 1024)
      Random.nextBytes(data, 0, data.size - 1)
      storage.put("test", data)
      val res = storage.get("test")
      if (!(res.contentEquals(data))) throw IllegalStateException("Stored value is not equal to retrieved one")
    } catch (e: Exception) {
      throw IllegalStateException("testManualEncryptionLarge failed ${e.message}", e)
    }
  }

  /**
   * Tests if null is returned for a wrong key.
   */
  fun testEmptyGet() {
    try {
      val storage: SecureStorage =
        SecureStorage.Builder(context, storageDir).setEnforceManualEncryption(true).build()
      storage.clear()
      if (storage.get("wrong") != null) throw IllegalStateException("Expected null, received an actual value")
    } catch (e: Exception) {
      throw IllegalStateException("testEmptyGet failed ${e.message}", e)
    }
  }

  /**
   * Tests if the list of keys is returned.
   */
  fun testKeys() {
    try {
      val storage = SecureStorage.Builder(context, storageDir).build()
      val keys = listOf("test", "test2")
      val value = byteArrayOf(1, 2, 3)
      for (key in keys) {
        storage.put(key, value)
      }
      if (!keys.containsAll(storage.keys())) throw IllegalStateException("Keys list doesn't contain expected values")
    } catch (e: Exception) {
      throw IllegalStateException("testKeys failed ${e.message}", e)
    }
  }

  /**
   * Tests if a value can be removed.
   */
  fun testRemove() {
    try {
      val storage = SecureStorage.Builder(context, storageDir).build()
      storage.put("test", byteArrayOf(1, 2, 3))
      storage.remove("test")
      if (storage.get("test") != null) throw IllegalStateException("Expected null value, received array of bytes")
    } catch (e: Exception) {
      throw IllegalStateException("testRemove failed ${e.message}", e)
    }
  }

  /**
   * Tests if every value can be cleared.
   */
  fun testClear() {
    try {
      val storage = SecureStorage.Builder(context, storageDir).build()
      storage.clear()
      storage.put("test", byteArrayOf(1, 2, 3))
      if (storage.keys().size != 1) throw IllegalStateException("Expected one key, received zero or more")
      storage.clear()
      if (storage.keys()
          .isNotEmpty()
      ) throw IllegalStateException("Expected zero keys, received more")
    } catch (e: Exception) {
      throw IllegalStateException("testClear failed: ${e.message}", e)
    }
  }

  /**
   * Tests if files are persisted by instantiating the [SecureStorage] twice.
   */
  fun testPersistence() {
    try {
      var storage = SecureStorage.Builder(context, storageDir).build()
      storage.clear()
      if (storage.keys()
          .isNotEmpty()
      ) throw IllegalStateException("Expected zero key, received more")
      if (storage.get("test") != null) throw IllegalStateException("Expected null value, received array of bytes")
      val value = byteArrayOf(1, 2, 3)
      storage.put("test", value)
      if (!(storage.get("test")
          .contentEquals(value))
      ) throw IllegalStateException("Stored value is not equal to retrieved one")
      storage = SecureStorage.Builder(context, storageDir).build()
      if (!(storage.get("test")
          .contentEquals(value))
      ) throw IllegalStateException("Stored value is not equal to retrieved one")
    } catch (e: Exception) {
      throw IllegalStateException("testPersistence failed: ${e.message}", e)
    }
  }
}
