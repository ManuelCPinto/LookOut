#include <Firebase_ESP_Client.h>
#include "addons/TokenHelper.h"
#include "addons/RTDBHelper.h"
#include "firebase_loader.h"

FirebaseAuth auth;
FirebaseConfig config;

bool loadFirebase(const char *apiKey, const char *databaseURL)
{
  config.api_key = apiKey;
  config.database_url = databaseURL;

  if (!Firebase.signUp(&config, &auth, "", ""))
  {
    return false;
  }

  config.token_status_callback = tokenStatusCallback;

  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);

  return true;
}