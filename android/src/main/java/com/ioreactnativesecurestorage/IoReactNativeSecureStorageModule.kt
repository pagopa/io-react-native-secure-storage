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
import com.pagopa.securestorage.SecureStorageException
import java.io.File
import java.nio.charset.StandardCharsets


class IoReactNativeSecureStorageModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  private var forceManualEncryption: Boolean = false
  private val storageDir: File = File(reactContext.applicationContext.filesDir, "secure-storage")

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

  /**
   * @see [SecureStorage.Builder.setEnforceManualEncryption]
   */
  @ReactMethod
  fun setEnforceManualEncryption(promise: Promise) {
    this.forceManualEncryption = true
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
        secureStorage?.let {
          it.put(key, data.toByteArray())
          promise.resolve(null)
        } ?: ModuleException.SECURE_STORE_NOT_INITIALIZED.reject(
          promise
        )
      } catch (e: Exception) {
        ModuleException.PUT_FAILED.reject(
          promise, Pair(ERROR_USER_INFO_KEY, getExceptionMessageOrEmpty(e))
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
        secureStorage?.let {
          val result = it.get(key)
          result?.let {
            promise.resolve(result.toString(StandardCharsets.UTF_8))
          } ?: ModuleException.VALUE_NOT_FOUND.reject(promise)
        } ?: ModuleException.SECURE_STORE_NOT_INITIALIZED.reject(
          promise
        )
      } catch (e: Exception) {
        ModuleException.GET_FAILED.reject(
          promise, Pair(ERROR_USER_INFO_KEY, getExceptionMessageOrEmpty(e))
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
        secureStorage?.let {
          it.clear()
          promise.resolve(null)
        } ?: ModuleException.SECURE_STORE_NOT_INITIALIZED.reject(
          promise
        )
      } catch (e: Exception) {
        ModuleException.CLEAR_FAILED.reject(
          promise, Pair(ERROR_USER_INFO_KEY, getExceptionMessageOrEmpty(e))
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
        secureStorage?.let {
          it.remove(key)
          promise.resolve(null)
        } ?: ModuleException.SECURE_STORE_NOT_INITIALIZED.reject(
          promise
        )
      } catch (e: Exception) {
        ModuleException.CLEAR_FAILED.reject(
          promise, Pair(ERROR_USER_INFO_KEY, getExceptionMessageOrEmpty(e))
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
      secureStorage?.let {
        val result: WritableArray = WritableNativeArray()
        var keys = it.keys()
        for (key in keys) {
          result.pushString(key)
        }
        promise.resolve(result)
      } ?: ModuleException.SECURE_STORE_NOT_INITIALIZED.reject(
        promise
      )
    } catch (e: Exception) {
      ModuleException.KEYS_RETRIEVAL_FAILED.reject(
        promise, Pair(ERROR_USER_INFO_KEY, getExceptionMessageOrEmpty(e))
      )
    }
  }

  /**
   * Extracts a message from an [Exception] with an empty string as fallback.
   * @param e an exception.
   * @return [e] message field or an empty string otherwise.
   */
  private fun getExceptionMessageOrEmpty(e: Exception): String {
    return e.message ?: ""
  }

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
      KEYS_RETRIEVAL_FAILED(Exception("KEYS_RETRIEVAL_FAILED")),
      SECURE_STORE_NOT_INITIALIZED(Exception("SECURE_STORE_NOT_INITIALIZED"));

      /**
       * Rejects the provided promise with the appropriate error message and additional data.
       *
       * @param promise the promise to be rejected.
       * @param args additional key-value pairs of data to be passed along with the error.
       */
      fun reject(
        promise: Promise, vararg args: Pair<String, String>
      ) {
        exMap(*args).let {
          promise.reject(it.first, ex.message, it.second)
        }
      }

      /**
       * Maps the additional key-value pairs of data to a pair containing the error message
       * and a WritableMap of the additional data.
       *
       * @param args additional key-value pairs of data.
       * @return A pair containing the error message and a WritableMap of the additional data.
       */
      private fun exMap(vararg args: Pair<String, String>): Pair<String, WritableMap> {
        val writableMap = WritableNativeMap()
        args.forEach { writableMap.putString(it.first, it.second) }
        return Pair(this.ex.message ?: "UNKNOWN", writableMap)
      }
    }
  }
}
