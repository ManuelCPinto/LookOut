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
static const unsigned long OWNER_RETRY_DELAY = 50UL;
static const unsigned long OWNER_TIMEOUT = 300000UL;
static const unsigned long WELCOME_BROADCAST_MS = 3000UL;
static const unsigned long WELCOME_RETRY_DELAY = 500UL;

String MQTT_TOPICS[] = {
    BuzzerData::TOPIC,
    UltrasonicData::TOPIC,
    FingerprintData::TOPIC,
    TAKE_PHOTO_TOPIC,
    OledData::TOPIC};
const size_t MQTT_TOPIC_COUNT = sizeof(MQTT_TOPICS) / sizeof(MQTT_TOPICS[0]);
String *fullTopics;

bool waitForOwner() {
  unsigned long start = millis();
  while (millis() - start < OWNER_TIMEOUT) {
    showRegistrationPrompt();  
    unsigned long t0 = millis();
    while (millis() - t0 < OWNER_POLL_INTERVAL) {
      loopMQTT(
        WROVER_UNIQUE_ID,
        MQTT_USERNAME,
        MQTT_PASSWORD,
        fullTopics,
        MQTT_TOPIC_COUNT
      );
      delay(OWNER_RETRY_DELAY);
    }
    if (deviceHasOwner(WROVER_UNIQUE_ID)) {
      Serial.println("→ owner found!");
      return true;
    }
    Serial.println("…still no owner, retrying");
  }
  Serial.println("!! owner lookup timed out");
  return false;
}

void broadcastWelcome()
{
  unsigned long start = millis();
  while (millis() - start < WELCOME_BROADCAST_MS)
  {
    showWelcome();
    loopMQTT(WROVER_UNIQUE_ID, MQTT_USERNAME, MQTT_PASSWORD,
             fullTopics, MQTT_TOPIC_COUNT);
    delay(WELCOME_RETRY_DELAY);
  }
}

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
  Serial.println("[WROVER] Received FINGERPRINT_UPDATE");
  if (fpd.isNew)
  {
    addFingerprintUserToFirebase(WROVER_UNIQUE_ID, fpd.userId);
    Serial.println("[WROVER] Fingerprint Registered to Firebase");
    {
      time_t now = time(nullptr);
      LogData logData = {
        LogType::NEW_FINGERPRINT,
        now,
        "",          
        fpd.userId
      };
      logToFirebase(WROVER_UNIQUE_ID, logData);
      Serial.println("[WROVER] Logged NEW_FINGERPRINT event");
    }
  }
  break;

    case FINGERPRINT_TOUCH:
      Serial.println("[WROVER] Received FINGERPRINT_TOUCH");
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
            fpd.userId
          };
          logToFirebase(WROVER_UNIQUE_ID, logData);
          Serial.println("[WROVER] Logged ring event after fingerprint touch");
        }
      );
      break;

    case FINGERPRINT_REGISTRATION:
      Serial.println("[WROVER] Received FINGERPRINT_REGISTRATION – forwarding to WROOM");
      publishMQTT(
        (string(WROOM_UNIQUE_ID) + "/" + FingerprintData::TOPIC).c_str(),
        payload,
        length
      );
      showRegisterPrompt();
      break;
  }
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
  }
  showFingerprintPrompt();
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

 if (deviceHasOwner(WROVER_UNIQUE_ID)) {
    Serial.println("already has owner");
  } else {
    Serial.println("no owner set, entering waitForOwner()");
    waitForOwner();
  }
  Serial.println("left loop");
  broadcastWelcome();
  showFingerprintPrompt();
}

void loop()
{
  loopMQTT(WROVER_UNIQUE_ID, MQTT_USERNAME, MQTT_PASSWORD,
           fullTopics, MQTT_TOPIC_COUNT);
  delay(2000);
}