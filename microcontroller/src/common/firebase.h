#ifndef FIREBASE_H
#define FIREBASE_H

#include <Firebase_ESP_Client.h>

extern FirebaseAuth auth;
extern FirebaseConfig config;

/**
 * Loads Firebase (REQUIRED AT THE START).
 *
 * @param apiKey Firebase API key.
 * @param databaseURL Firebase Realtime Database URL.
 * @return Whether loaded successfully.
 */
bool loadFirebase(const char *apiKey, const char *databaseURL);

#endif