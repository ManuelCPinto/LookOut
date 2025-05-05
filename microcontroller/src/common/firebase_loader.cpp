#include <Firebase_ESP_Client.h>
#include "addons/TokenHelper.h"
#include "addons/RTDBHelper.h"
#include "firebase_loader.h"

FirebaseAuth auth;
FirebaseConfig config;

bool loadFirebase(const char *api_key, const char *database_url)
{
  config.api_key = api_key;
  config.database_url = database_url;

  if (!Firebase.signUp(&config, &auth, "", "")) {
    return false;
  }

  config.token_status_callback = tokenStatusCallback;

  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);

  return true;
}