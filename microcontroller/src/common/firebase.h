#ifndef FIREBASE_H
#define FIREBASE_H

#include <Firebase_ESP_Client.h>

extern FirebaseAuth auth;
extern FirebaseConfig config;

/**
 * Loads Firebase (REQUIRED AT THE START).
 *
 * @param apiKey Firebase API key.
 * @param email Firebase's account email.
 * @param password Firebase's account password.
 * @return Whether loaded successfully.
 */
bool loadFirebase(const char *apiKey, const std::string email = "", const std::string password = "");

#endif