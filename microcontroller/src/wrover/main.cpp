#include <HardwareSerial.h>
#include <ArduinoJson.h>
#include <common/wifi.h>
#include <common/camera.h>
#include <common/env/env.h>
#include <common/utils.h>
#include <common/mqtt.h>
#include <common/mqtt_data.h>
#include <common/supabase.h>
#include <common/firebase.h>
#include "actions/hardware.h"
#include "actions/database.h"
#undef B1
#include <fmt/core.h>

using namespace std;
static const unsigned long OWNER_POLL_INTERVAL = 5000UL;
static const unsigned long REGISTRATION_RETRY_DELAY = 500UL;

static const unsigned long WELCOME_BROADCAST_INTERVAL = 5000UL;
static const unsigned long WELCOME_RETRY_DELAY = 500UL;

static char pendingUserId[33] = {0};
String MQTT_TOPICS[] = {
    BuzzerData::TOPIC,
    UltrasonicData::TOPIC,
    FingerprintData::TOPIC,
    TAKE_PHOTO_TOPIC,
    OledData::TOPIC};
const size_t MQTT_TOPIC_COUNT = sizeof(MQTT_TOPICS) / sizeof(MQTT_TOPICS[0]);
String *fullTopics;

void mqttCallback(char *topic, uint8_t *payload, unsigned int length)
{
  StaticJsonDocument<256> docIn;
  DeserializationError err = deserializeJson(docIn, payload, length);
  if (err)
    return;

  string prefix = string(WROVER_UNIQUE_ID) + "/";
  if (strncmp(topic, prefix.c_str(), prefix.length()) != 0)
    return;
  topic += prefix.length();

  if (strcmp(topic, BuzzerData::TOPIC) == 0)
  {
    BuzzerData b = BuzzerData::fromJson(docIn);
    beep(b.duration);
    return;
  }

  if (strcmp(topic, UltrasonicData::TOPIC) == 0)
  {
    UltrasonicData u = UltrasonicData::fromJson(docIn);
    if (u.isClose)
    {
      takePhotoToSupabase(
          SUPABASE_BUCKET,
          WROVER_UNIQUE_ID,
          [&](string photoURL, time_t timestamp)
          {
            LogData logData = {
                LogType::PROXIMITY,
                timestamp,
                photoURL.c_str(),
                ""};
            logToFirebase(WROVER_UNIQUE_ID, logData);
          });
    }
    return;
  }

  if (strcmp(topic, FingerprintData::TOPIC) == 0)
  {
    FingerprintData fpd = FingerprintData::fromJson(docIn);
    switch (fpd.type)
    {
    case FINGERPRINT_UPDATE:
      if (fpd.isNew)
      {
        addFingerprintUserToFirebase(WROVER_UNIQUE_ID, fpd.userId);
      }
      break;
    case FINGERPRINT_TOUCH:
      beep(2000);
      takePhotoToSupabase(
          SUPABASE_BUCKET,
          WROVER_UNIQUE_ID,
          [=](string photoURL, time_t timestamp)
          {
            LogData logData = {
                LogType::RING_DOORBELL,
                timestamp,
                photoURL.c_str(),
                fpd.userId};
            logToFirebase(WROVER_UNIQUE_ID, logData);
          });
      break;
    case FINGERPRINT_REGISTRATION:
      publishMQTT(
          (string(WROOM_UNIQUE_ID) + "/" + FingerprintData::TOPIC).c_str(),
          payload,
          length);
      break;
    }
    return;
  }

  if (strcmp(topic, TAKE_PHOTO_TOPIC) == 0)
  {
    takePhotoToSupabase(
        SUPABASE_BUCKET,
        WROVER_UNIQUE_ID,
        [=](string photoURL, time_t timestamp)
        {
          LogData logData = {
              LogType::USER_REQUEST,
              timestamp,
              photoURL.c_str(),
              ""};
          logToFirebase(WROVER_UNIQUE_ID, logData);
        });
    return;
  }

  if (strcmp(topic, OledData::TOPIC) == 0)
  {
    publishMQTT(
        (string(WROOM_UNIQUE_ID) + "/" + OledData::TOPIC).c_str(),
        payload,
        length);
    return;
  }
}

void setup()
{
  Serial.begin(9600);
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(LED_PIN, OUTPUT);

  Serial.println("Loading WiFi...");
  connectWifi(WIFI_SSID, WIFI_PASSWORD);

  Serial.println("Loading timestamp...");
  configTimestamp();

  Serial.println("Loading camera...");
  loadCamera();

  Serial.println("Loading Firebase...");
  loadFirebase(FIREBASE_API_KEY, FIREBASE_EMAIL, FIREBASE_PASSWORD);

  Serial.println("Loading Supabase...");
  loadSupabase(SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_USERNAME, SUPABASE_PASSWORD);

  Serial.println("Loading MQTT...");
  loadMQTT(MQTT_SERVER, MQTT_PORT, mqttCallback);

  fullTopics = addPrefixToTopics(
      fmt::format("{}/", WROVER_UNIQUE_ID).c_str(),
      MQTT_TOPICS,
      MQTT_TOPIC_COUNT);

  Serial.println("------------------");
  Serial.printf("Unique ID: %s\n", WROVER_UNIQUE_ID);
  Serial.printf("MAC address: %s\n", WiFi.macAddress());
  Serial.println("------------------");

  if (!deviceHasOwner(WROVER_UNIQUE_ID))
  {
    while (!deviceHasOwner(WROVER_UNIQUE_ID))
    {
      showRegistrationPrompt();
      unsigned long start = millis();
      while (millis() - start < OWNER_POLL_INTERVAL)
      {
        loopMQTT(
            WROVER_UNIQUE_ID,
            MQTT_USERNAME,
            MQTT_PASSWORD,
            fullTopics,
            MQTT_TOPIC_COUNT);
        delay(50);
      }
    }
  }
  showFingerprintPrompt();
  delay(200);
}

void loop()
{
  showFingerprintPrompt();

  loopMQTT(
      WROVER_UNIQUE_ID,
      MQTT_USERNAME,
      MQTT_PASSWORD,
      fullTopics,
      MQTT_TOPIC_COUNT);

  delay(2000);
}