#include <Firebase_ESP_Client.h>
#include "addons/TokenHelper.h"
#include "firebase.h"

FirebaseAuth auth;
FirebaseConfig config;
extern FirebaseData fbdo;

extern const char *FIREBASE_PROJECT;

bool loadFirebase(const char *apiKey, const char *email = nullptr, const char *password = nullptr)
{
  config.api_key = apiKey;

  Serial.printf("Firebase API Key: %s\n", apiKey);
  Serial.printf("Firestore Project : %s\n\n", FIREBASE_PROJECT);

  if (!Firebase.signUp(&config, &auth, email ? email : "", password ? password : ""))
  {
    Serial.printf("Firebase anon sign-up failed: %s\n",
                  config.signer.signupError.message.c_str());
    return false;
  }

  config.token_status_callback = tokenStatusCallback;
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);

  return true;
}
