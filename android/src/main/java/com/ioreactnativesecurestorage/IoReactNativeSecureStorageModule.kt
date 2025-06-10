package com.ioreactnativesecurestorage

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.WritableNativeArray
import com.facebook.react.bridge.WritableNativeMap
import com.pagopa.securestorage.SecureStorage
import java.io.File
import java.nio.charset.StandardCharsets


class IoReactNativeSecureStorageModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  private var forceManualEncryption: Boolean = false
  private val storageDir: File = File(reactContext.applicationContext.filesDir, "secure-storage")
  private val testsObject = IoReactNativeSecureStorageTests(reactContext)

  /**
   * Lazily initialize the secure storage object only when the variable is called,
   * otherwise it won't be created. Once created the same object will be used during
   * its lifecycle.
   */
  private val secureStorage: SecureStorage? by lazy {
    try {
      val secureStorage = SecureStorage.Builder(reactContext.applicationContext, storageDir)
        .setEnforceManualEncryption(forceManualEncryption)
      secureStorage.build()
    } catch (e: Exception) {
      null
    }
  }

  override fun getName(): String {
    return NAME
  }

  private fun performSecureAction(promise: Promise, action: SecureStorage.() -> Unit) {
    secureStorage?.run(action) ?: ModuleException.SECURE_STORE_NOT_INITIALIZED.reject(promise)
  }


  /**
   * @see [SecureStorage.Builder.setEnforceManualEncryption]
   */
  @ReactMethod
  fun setEnforceManualEncryption(isEnforced: Boolean, promise: Promise) {
    this.forceManualEncryption = isEnforced
    promise.resolve(null)
  }

  /**
   * @see [SecureStorage.put]
   * This is run on a different thread due to heavy I/O operations.
   */
  @ReactMethod
  fun put(key: String, data: String, promise: Promise) {
    Thread {
      try {
        performSecureAction(promise) {
          put(key, data.toByteArray())
          promise.resolve(null)
        }
      } catch (e: Exception) {
        ModuleException.PUT_FAILED.reject(
          promise,
          Pair(ERROR_USER_INFO_KEY, getExceptionMessageOrEmpty(e)),
          exception = e
        )
      }
    }.start()
  }

  /**
   * @see [SecureStorage.get]
   * This is run on a different thread due to heavy I/O operations.
   */
  @ReactMethod
  fun get(key: String, promise: Promise) {
    Thread {
      try {
        performSecureAction(promise) {
          val value = get(key)
          value?.let {
            promise.resolve(it.toString(StandardCharsets.UTF_8))
          } ?: ModuleException.VALUE_NOT_FOUND.reject(promise)
        }
      } catch (e: Exception) {
        ModuleException.GET_FAILED.reject(
          promise,
          Pair(ERROR_USER_INFO_KEY, getExceptionMessageOrEmpty(e)),
          exception = e
        )
      }
    }.start()
  }

  /**
   * @see [SecureStorage.clear]
   * This is run on a different thread due to heavy I/O operations.
   */
  @ReactMethod
  fun clear(promise: Promise) {
    Thread {
      try {
        performSecureAction(promise) {
          clear()
          promise.resolve(null)
        }
      } catch (e: Exception) {
        ModuleException.CLEAR_FAILED.reject(
          promise,
          Pair(ERROR_USER_INFO_KEY, getExceptionMessageOrEmpty(e)),
          exception = e
        )
      }
    }.start()
  }

  /**
   * @see [SecureStorage.remove]
   * This is run on a different thread due to heavy I/O operations.
   */
  @ReactMethod
  fun remove(key: String, promise: Promise) {
    Thread {
      try {
        performSecureAction(promise) {
          remove(key)
          promise.resolve(null)
        }
      } catch (e: Exception) {
        ModuleException.REMOVE_FAILED.reject(
          promise,
          Pair(ERROR_USER_INFO_KEY, getExceptionMessageOrEmpty(e)),
          exception = e
        )
      }
    }.start()
  }

  /**
   * @see [SecureStorage.keys]
   */
  @ReactMethod
  fun keys(promise: Promise) {
    try {
      performSecureAction(promise) {
        val result: WritableArray = WritableNativeArray()
        val keys = keys()
        for (key in keys) {
          result.pushString(key)
        }
        promise.resolve(result)
      }
    } catch (e: Exception) {
      ModuleException.KEYS_RETRIEVAL_FAILED.reject(
        promise,
        Pair(ERROR_USER_INFO_KEY, getExceptionMessageOrEmpty(e)),
        exception = e
      )
    }
  }

  /**
   * This class contains the very same tests as the instrumented tests defined in this project
   * which can be called directly from the react-native bridge.
   * Runs a few tests with both manual and automatic encryption.
   * Resolves the promise if everything goes well or rejects the promise with the occurred error.
   */
  @ReactMethod
  fun tests(promise: Promise) {
    Thread {
      try {
        testsObject.testAutomaticEncryption()
        testsObject.testAutomaticEncryptionLarge()
        testsObject.testManualEncryption()
        testsObject.testManualEncryptionLarge()
        testsObject.testEmptyGet()
        testsObject.testKeys()
        testsObject.testRemove()
        testsObject.testClear()
        testsObject.testPersistence()
        promise.resolve(null)
      } catch (e: Exception) {
        ModuleException.TEST_EXCEPTION.reject(
          promise,
          Pair(ERROR_USER_INFO_KEY, getExceptionMessageOrEmpty(e)),
          exception = e
        )
      }
    }.start()
  }

  /**
   * Extracts a message from an [Exception] with an empty string as fallback.
   * @param e an exception.
   * @return [e] message field or an empty string otherwise.
   */
  private fun getExceptionMessageOrEmpty(e: Exception): String = e.message ?: ""

  companion object {
    const val NAME = "IoReactNativeSecureStorage"
    const val ERROR_USER_INFO_KEY = "error"

    private enum class ModuleException(
      val ex: Exception
    ) {
      VALUE_NOT_FOUND(Exception("VALUE_NOT_FOUND")),
      GET_FAILED(Exception("GET_FAILED")),
      PUT_FAILED(Exception("PUT_FAILED")),
      CLEAR_FAILED(Exception("CLEAR_FAILED")),
      REMOVE_FAILED(Exception("REMOVE_FAILED")),
      KEYS_RETRIEVAL_FAILED(Exception("KEYS_RETRIEVAL_FAILED")),
      SECURE_STORE_NOT_INITIALIZED(Exception("SECURE_STORE_NOT_INITIALIZED")),
      TEST_EXCEPTION(Exception("TEST_EXCEPTION"));

      /**
       * Rejects the provided promise with the appropriate error message and additional data.
       * Automatically includes native stack trace when an exception is provided.
       *
       * @param promise the promise to be rejected
       * @param args additional key-value pairs to include in the error data
       * @param exception optional throwable to include native stack trace (defaults to this.ex)
       */
      fun reject(
        promise: Promise,
        vararg args: Pair<String, String>,
        exception: Throwable? = null
      ) {
        val errorCode = name
        val errorMessage = this.ex.message ?: "UNKNOWN"

        val extra = WritableNativeMap().apply {
          args.forEach { putString(it.first, it.second) }
        }

        promise.reject(errorCode, errorMessage, exception ?: this.ex, extra)
      }
    }
  }
}
