package com.pagopa.securestorage

import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.platform.app.InstrumentationRegistry
import org.junit.Assert.assertArrayEquals
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test
import org.junit.runner.RunWith
import java.io.File
import kotlin.random.Random

/**
 * Instrumented test, which will execute on an Android device.
 *
 * See [testing documentation](http://d.android.com/tools/testing).
 */
@RunWith(AndroidJUnit4::class)
class SecureStorageInstrumentedTest {
  private val context = InstrumentationRegistry.getInstrumentation().targetContext
  private val storageDir: File = File(context.dataDir, "instrumental-testing")

  /**
   * Tests a put and get method with automatic encryption.
   */
  @Test
  fun testAutomaticEncryption() {
    val storage = SecureStorage.Builder(context, storageDir).build()
    val value = byteArrayOf(1, 2, 3)
    storage.put("test", value)
    assertArrayEquals(storage.get("test"), value)
  }

  /**
   * Tests a put and get method with large data and automatic encryption.
   */
  @Test
  fun testAutomaticEncryptionLarge() {
    val storage: SecureStorage = SecureStorage.Builder(context, storageDir).build()
    storage.clear()
    val data = ByteArray(2 * 1024 * 1024)
    Random.nextBytes(data, 0, data.size - 1)
    storage.put("test", data)
    assertArrayEquals(storage.get("test"), data)
  }

  /**
   * Tests a put and get method with manual encryption.
   */
  @Test
  fun testManualEncryption() {
    val storage = SecureStorage.Builder(context, storageDir).setUseEncryption(true).build()
    val value = byteArrayOf(1, 2, 3)
    storage.put("test", value)
    assertArrayEquals(storage.get("test"), value)
  }

  /**
   * Tests a put and get method with large data and manual encryption.
   */
  @Test
  fun testManualEncryptionLarge() {
    val storage: SecureStorage =
      SecureStorage.Builder(context, storageDir).setUseEncryption(true).build()
    storage.clear()
    val data = ByteArray(2 * 1024 * 1024)
    Random.nextBytes(data, 0, data.size - 1)
    storage.put("test", data)
    val res = storage.get("test")
    assertArrayEquals(res, data)
  }

  /**
   * Tests if null is returned for a wrong key.
   */
  @Test
  fun testEmptyGet() {
    val storage: SecureStorage =
      SecureStorage.Builder(context, storageDir).setUseEncryption(true).build()
    storage.clear()
    assertNull(storage.get("wrong"))
  }

  /**
   * Tests if the list of keys is returned.
   */
  @Test
  fun testKeys() {
    val storage = SecureStorage.Builder(context, storageDir).build()
    val keys = listOf("test", "test2")
    val value = byteArrayOf(1, 2, 3)
    for (key in keys) {
      storage.put(key, value)
    }
    assertEquals(keys, storage.keys())
  }

  /**
   * Tests if a value can be removed.
   */
  @Test
  fun testRemove() {
    val storage = SecureStorage.Builder(context, storageDir).build()
    storage.put("test", byteArrayOf(1, 2, 3))
    storage.remove("test")
    assertNull(storage.get("test"))
  }

  /**
   * Tests if every value can be cleared.
   */
  @Test
  fun testClear() {
    val storage = SecureStorage.Builder(context, storageDir).build()
    storage.put("test", byteArrayOf(1, 2, 3))
    assertEquals(1, storage.keys().size.toLong())
    storage.clear()
    assertEquals(0, storage.keys().size.toLong())
  }

  /**
   * Tests if files are persisted by instantiating the [SecureStorage] twice.
   */
  @Test
  fun testPersistence() {
    var storage = SecureStorage.Builder(context, storageDir).build()
    storage.clear()
    assertEquals(0, storage.keys().size)
    assertNull(storage.get("test"))
    val value = byteArrayOf(1, 2, 3)
    storage.put("test", value)
    assertArrayEquals(storage.get("test"), value)
    storage = SecureStorage.Builder(context, storageDir).build()
    assertArrayEquals(storage.get("test"), value)
  }
}
