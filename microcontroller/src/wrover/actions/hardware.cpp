#include <common/camera.h>
#include <common/supabase.h>
#include <common/utils.h>
#include <common/env/env.h>
#include <Firebase_ESP_Client.h>
#undef B1
#include <fmt/core.h>
#include "database.h"

using namespace std;

const string SUPABASE_PUBLIC_STORAGE_URL_TEMPLATE = "{}/storage/v1/object/public/{}/{}";

FirebaseData fbdo;

void beep(uint8_t pin, uint32_t duration)
{
  digitalWrite(pin, HIGH);
  delay(duration);
  digitalWrite(pin, LOW);
}

void takePhotoToSupabase(const char *bucket, const char *folderName, function<void(string photoURL, time_t timestamp)> callback = nullptr)
{
  camera_fb_t *fb = takePhoto();

  time_t now = time(NULL);
  string filename = now + ".jpg";
  string filePath = (string)folderName + "/" + filename;

  int res = supabase.upload(bucket, filePath.c_str(), "image/jpeg", fb->buf, fb->len);

  esp_camera_fb_return(fb);

  string photoURL = fmt::format(SUPABASE_PUBLIC_STORAGE_URL_TEMPLATE, SUPABASE_URL, bucket, filePath);

  callback(photoURL, now);
}

void addFingerprintUserToFirebase(const char *nodeId, const char *userId)
{
  Firebase.RTDB.setBoolAsync(&fbdo, fmt::format("/devices/{}/users/{}", nodeId, userId), true);
}

void logToFirebase(const char *nodeId, LogData logData)
{
  FirebaseJson json;
  logData.toJson(json);
  Firebase.RTDB.setJSONAsync(&fbdo, fmt::format("/devices/{}/logs", nodeId), &json);
}