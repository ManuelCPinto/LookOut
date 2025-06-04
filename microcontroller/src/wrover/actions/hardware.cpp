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
#include <common/mqtt.h>
#include <common/mqtt_data.h>

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
  JsonVariant valuesVar = inDoc["fields"]["registeredUsers"]["arrayValue"]["values"];
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

  if (!Firebase.Firestore.patchDocument(&fbdo, FIREBASE_PROJECT, "", path, body, "registeredUsers"))
  {
    Serial.printf("patchDocument failed: %s\n", fbdo.errorReason().c_str());
  }
}

void logToFirebase(const char *nodeId, LogData logData)
{
  FirebaseJson json;
  logData.toJson(json);
  Firebase.RTDB.setJSON(&fbdo, fmt::format("/devices/{}/logs/{}", nodeId, logData.createdAt), &json);
}

bool deviceHasOwner(const char *nodeId)
{
  String path = "devices/";
  path.concat(nodeId);
  if (!Firebase.Firestore.getDocument(&fbdo, FIREBASE_PROJECT, "", path.c_str())) {
    Serial.printf("getDocument failed: %s\n", fbdo.errorReason().c_str());
    return false; 
  }
  if (fbdo.httpCode() != 200) {
    Serial.printf("HTTP %d on getDocument for %s\n", fbdo.httpCode(), path.c_str());
    return false;
  }
  DynamicJsonDocument json(512);
  deserializeJson(json, fbdo.payload());
  const char *owner = json["fields"]["ownerId"]["stringValue"];
  if (!owner || strlen(owner) == 0) {
    Serial.println("no owner set");
    return false;
  }

  Serial.printf("ownerId is set to: %s\n", owner);
  return true;
}

void sendOled(const char *payloadJson)
{
  static unsigned long lastTs = 0;
  unsigned long now = millis();
  Serial.printf("\n[WROVER %lu] ➤ sendOled() called\n", now - lastTs);
  lastTs = now;

  String topic = WROOM_UNIQUE_ID;
  topic.concat("/");
  topic.concat(OledData::TOPIC);

  Serial.printf("[WROVER]   topic: %s\n", topic.c_str());
  Serial.printf("[WROVER]   payload: %s\n", payloadJson);
  publishMQTT(topic.c_str(), (uint8_t*)payloadJson, strlen(payloadJson));
}


void showRegistrationPrompt()
{
  JsonDocument jd;
  jd["layout"]   = "side_by_side";
  jd["qrData"]   = WROVER_UNIQUE_ID;
  jd["textData"] = "Please register via app";

  String payload;
  serializeJson(jd, payload);
  sendOled(payload.c_str());
}

void showWelcome()
{
  JsonDocument jd;
  jd["message"]   = "Welcome to Lookout!";
  jd["isQrCode"]  = false;

  String payload;
  serializeJson(jd, payload);
  sendOled(payload.c_str());
}