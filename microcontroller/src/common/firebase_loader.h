#ifndef FIREBASE_LOADER_H
#define FIREBASE_LOADER_H

#include <Firebase_ESP_Client.h>

extern FirebaseAuth auth;
extern FirebaseConfig config;

/**
 * Loads Firebase (REQUIRED AT THE START).
 *
 * @return Whether loaded successfully.
 */
bool loadFirebase(const char *api_key, const char *database_url);

#endif