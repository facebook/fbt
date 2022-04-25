/**
 * (c) Meta Platforms, Inc. and affiliates. Confidential and proprietary.
 * This file is generated. Do not modify it manually!
 * @codegen-command : phps RepoSync intl_oss_fbt
 * @codegen-source : fbsource/xplat/intl/oss-fbt/packages/react-native-fbt/android/src/main/java/com/facebook/react/modules/FbtModule.java
 * @generated SignedSource<<c75dd5d57eb42750ed38a715e5031c00>>
 */
/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

package com.facebook.react.modules;

import android.util.Log;
import androidx.annotation.NonNull;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import org.json.JSONException;
import org.json.JSONObject;

public class FbtModule extends ReactContextBaseJavaModule {

  public static final String NAME = "FbtModule";

  private static final String RAW_FILE_NAME = "localizable";
  private static final String RAW_RES_FOLDER_NAME = "raw";

  private final ReactApplicationContext context;

  private Map<String, String> translationsCache;

  public FbtModule(ReactApplicationContext reactContext) {
    super(reactContext);

    this.context = reactContext;
    this.translationsCache = new HashMap<>();

    readTranslationsFile();
  }

  @Override
  @NonNull
  public String getName() {
    return NAME;
  }

  /**
   * Tries to get the string for the hash key from the cache.
   *
   * @param hash Key for the translation.
   * @return The translation for the key or empty string if not found.
   */
  @ReactMethod(isBlockingSynchronousMethod = true)
  public String getString(String hash) {
    if (translationsCache.containsKey(hash)) {
      return translationsCache.get(hash);
    }

    // hash key not found.
    return "";
  }

  @ReactMethod(isBlockingSynchronousMethod = true)
  public int getDictionarySize() {
    return translationsCache.size();
  }

  /** 1- Reads the file from the "res/raw" folder. 2- Parses the json into a map. */
  private void readTranslationsFile() {

    // Reads the file.
    String jsonString = null;
    try {
      jsonString = readLocalizedJSONFile();
    } catch (IOException e) {
      Log.e(NAME, "Error reading from raw resources: " + e.getMessage());
    }

    // Parses the json into a map.
    if (jsonString != null) {
      try {
        parseJsonToDict(jsonString);
      } catch (JSONException e) {
        Log.e(NAME, "Error parsing json file: " + e.getMessage());
      }
    }
  }

  /**
   * Parses a JSON file with the format: { "key": "value" }
   *
   * <p>into a Map<String, String>.
   *
   * <p>
   *
   * <p>- An empty map is returned if no translations were found. - If there's a parsing error
   * getting a value, an empty value is added. - {@link #translationsCache} contains the results.
   *
   * @param jsonString The json-formatted string to parse.
   * @throws JSONException If the jsonString has an incorrect format.
   */
  private void parseJsonToDict(String jsonString) throws JSONException {
    // reset cached dictionary
    translationsCache = new HashMap<>();

    // parse the jsonString.
    JSONObject jsonObject = new JSONObject(jsonString);

    Iterator<?> keys = jsonObject.keys();

    while (keys.hasNext()) {
      String key = (String) keys.next();

      String value = "";
      try {
        value = jsonObject.getString(key);
      } catch (JSONException e) {
        // Error parsing value. Keep going.
        Log.e(NAME, "Error parsing a field from json file: " + e.getMessage());
      }
      translationsCache.put(key, value);
    }
  }

  /**
   * Reads text from an InputStream
   *
   * @return The text in the stream or null if an error occurs.
   */
  private String readLocalizedJSONFile() throws IOException {
    int localizedJSONFileID = getLocalizedJSONFileID();
    if (localizedJSONFileID == 0) {
      Log.w(NAME, "Translations file not found in raw folder");
      return null;
    }

    // Takes the translations file from the raw folder
    InputStream inputStream = context.getResources().openRawResource(localizedJSONFileID);

    ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

    byte[] buffer = new byte[1024];
    int len;

    while ((len = inputStream.read(buffer)) != -1) {
      outputStream.write(buffer, 0, len);
    }
    outputStream.close();
    inputStream.close();

    return outputStream.toString();
  }

  /**
   * Gets the raw resource ID
   *
   * @return The resource ID or 0 if it doesn't exist.
   */
  private int getLocalizedJSONFileID() {
    return context
        .getResources()
        .getIdentifier(RAW_FILE_NAME, RAW_RES_FOLDER_NAME, context.getPackageName());
  }
}
