#include <common/camera.h>
#include <common/supabase.h>
#include <common/utils.h>
#include <common/env/env.h>
#include <Firebase_ESP_Client.h>
#undef B1
#include <fmt/core.h>
#include <Ticker.h>
#include "database.h"
#include "hardware.h"

using namespace std;

const string SUPABASE_PUBLIC_STORAGE_URL_TEMPLATE = "{}/storage/v1/object/public/{}/{}";

Ticker buzzerTimeoutTimer;

extern const char *FIREBASE_PROJECT;

FirebaseData fbdo;

void beep(uint32_t duration)
{
  digitalWrite(BUZZER_PIN, HIGH);
  buzzerTimeoutTimer.once_ms(duration, []()
                             { digitalWrite(BUZZER_PIN, LOW); });
}

void takePhotoToSupabase(const char *bucket, const char *folderName, function<void(string photoURL, time_t timestamp)> callback)
{
  camera_fb_t *fb = takePhoto();

  time_t now = time(NULL);
  string filename = to_string(now) + ".jpg";
  string filePath = (string)folderName + "/" + filename;

  int res = supabase.upload(bucket, filePath.c_str(), "image/jpeg", fb->buf, fb->len);

  esp_camera_fb_return(fb);

  string photoURL = fmt::format(SUPABASE_PUBLIC_STORAGE_URL_TEMPLATE, SUPABASE_URL, bucket, filePath);

  callback(photoURL, now);
}

void addFingerprintUserToFirebase(const char *nodeId, const char *userId)
{
  Serial.printf("nodeId: %s | userId: %s\n", nodeId, userId);

  String path = "devices/";
  path.concat(nodeId);
  if (!Firebase.Firestore.getDocument(&fbdo, FIREBASE_PROJECT, "", path.c_str()))
  {
    Serial.printf("getDocument failed: %s\n", fbdo.errorReason().c_str());
    return;
  }
  if (fbdo.httpCode() != 200)
  {
    Serial.printf("HTTP %d on getDocument\n", fbdo.httpCode());
    return;
  }

  DynamicJsonDocument inDoc(1024);
  deserializeJson(inDoc, fbdo.payload());
  JsonVariant valuesVar = inDoc["fields"]
                               ["registeredUsers"]
                               ["arrayValue"]
                               ["values"];
  bool hasExisting = valuesVar.is<JsonArray>();
  JsonArray existing = hasExisting ? valuesVar.as<JsonArray>() : JsonArray();

  String body = "{\"fields\":{";
  body.concat("\"registeredUsers\":{");
  body.concat("\"arrayValue\":{");
  body.concat("\"values\":[");
  if (hasExisting)
  {
    for (JsonObject v : existing)
    {
      String prev = v["stringValue"].as<String>();
      body.concat("{\"stringValue\":\"");
      body.concat(prev);
      body.concat("\"},");
    }
  }

  body.concat("{\"stringValue\":\"");
  body.concat(userId);
  body.concat("\"}");
  body.concat("]}}}}");

  if (!Firebase.Firestore.patchDocument(
          &fbdo,
          FIREBASE_PROJECT,
          "",
          path, 
          body,    
          "registeredUsers"))
  {
    Serial.printf("patchDocument failed: %s\n",
                  fbdo.errorReason().c_str());
  }
}
void logToFirebase(const char *nodeId, LogData logData)
{
  FirebaseJson json;
  logData.toJson(json);
  Firebase.RTDB.setJSON(&fbdo, fmt::format("/devices/{}/logs/{}", nodeId, logData.createdAt), &json);
}