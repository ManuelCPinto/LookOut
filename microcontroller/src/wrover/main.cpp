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
  JsonDocument doc;
  deserializeJson(doc, payload, length);

  string topicPrefix = string(WROVER_UNIQUE_ID) + "/";
  size_t topicPrefixLen = strlen(topicPrefix.c_str());
  if (strncmp(topic, topicPrefix.c_str(), topicPrefixLen) != 0)
  {
    return;
  }
  topic += topicPrefixLen;

  if (strcmp(topic, BuzzerData::TOPIC) == 0)
  {
    BuzzerData buzzerData = BuzzerData::fromJson(doc);
    beep(buzzerData.duration);
  }
  else if (strcmp(topic, UltrasonicData::TOPIC) == 0)
  {
    UltrasonicData ultrasonicData = UltrasonicData::fromJson(doc);
    if (ultrasonicData.isClose)
    {
      takePhotoToSupabase(SUPABASE_BUCKET, WROVER_UNIQUE_ID, [](string photoURL, time_t timestamp)
                          {
        LogData logData = {PROXIMITY, timestamp, photoURL.c_str()};
        logToFirebase(WROVER_UNIQUE_ID, logData); });
    }
  }
  else if (strcmp(topic, FingerprintData::TOPIC) == 0)
  {
    FingerprintData fingerprintData = FingerprintData::fromJson(doc);
    switch (fingerprintData.type)
    {
    case FINGERPRINT_UPDATE:
      if (fingerprintData.isNew)
      {
        addFingerprintUserToFirebase(WROVER_UNIQUE_ID, fingerprintData.userId);
      }
      break;
    case FINGERPRINT_TOUCH:
      beep(2000);
      takePhotoToSupabase(SUPABASE_BUCKET, WROVER_UNIQUE_ID, [=](string photoURL, time_t timestamp) {
        LogData logData = {RING_DOORBELL, timestamp, photoURL.c_str(), fingerprintData.userId};
        logToFirebase(WROVER_UNIQUE_ID, logData); });
      break;
    case FINGERPRINT_REGISTRATION:
      publishMQTT(string(WROOM_UNIQUE_ID + string("/") + topic).c_str(), payload, length);
      break;
    }
  }
  else if (strcmp(topic, TAKE_PHOTO_TOPIC) == 0)
  {
    takePhotoToSupabase(SUPABASE_BUCKET, WROVER_UNIQUE_ID, [](string photoURL, time_t timestamp)
                        {
      LogData logData = {USER_REQUEST, timestamp, photoURL.c_str()};
      logToFirebase(WROVER_UNIQUE_ID, logData); });
  }
  else if (strcmp(topic, OledData::TOPIC) == 0)
  {
    publishMQTT(string(WROOM_UNIQUE_ID + string("/") + topic).c_str(), payload, length);
  }
}

void setup()
{
  Serial.begin(9600);

  pinMode(BUZZER_PIN, OUTPUT);

  Serial.println("Loading WiFi...");
  connectWifi(WIFI_SSID, WIFI_PASSWORD);
  Serial.println("Loading timestamp...");
  configTimestamp();
  Serial.println("Loading camera...");
  loadCamera();
  Serial.println("Loading Firebase...");
  loadFirebase(FIREBASE_API_KEY);
  //Serial.println("Loading Supabase...");
  //loadSupabase(SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_USERNAME, SUPABASE_PASSWORD);
  Serial.println("Loading MQTT...");
  loadMQTT(MQTT_SERVER, MQTT_PORT, mqttCallback);

  fullTopics = addPrefixToTopics(fmt::format("{}/", WROVER_UNIQUE_ID).c_str(), MQTT_TOPICS, MQTT_TOPIC_COUNT);

  Serial.println("------------------");
  Serial.print("Unique ID: ");
  Serial.println(WROVER_UNIQUE_ID);
  Serial.print("MAC address: ");
  Serial.println(WiFi.macAddress());
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
          MQTT_TOPIC_COUNT
        );
        delay(50);
      }
    }
    showWelcome();
    delay(5000);
  } 
  else 
  {
    showWelcome();
    delay(5000);
  }

}

void loop()
{
  loopMQTT(WROVER_UNIQUE_ID, MQTT_USERNAME, MQTT_PASSWORD, fullTopics, MQTT_TOPIC_COUNT);
}
