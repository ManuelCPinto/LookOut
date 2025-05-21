#include <HardwareSerial.h>
#include <ArduinoJson.h>
#include <common/wifi.h>
#include <common/camera.h>
#include <common/env/env.h>
#include <common/esp_now.h>
#include <common/mqtt.h>
#include <common/mqtt_data.h>
#include <common/esp_now_data.h>
#include <common/supabase.h>
#include <common/utils.h>
#include <common/firebase.h>
#include "actions/hardware.h"
#include "actions/database.h"

using namespace std;

const int BUZZER_PIN = 15;

const char *MQTT_TOPICS[] = {
    BuzzerData::TOPIC,
    OledData::TOPIC,
    FingerprintData::TOPIC,
    TAKE_PHOTO_TOPIC};
const size_t MQTT_TOPIC_COUNT = sizeof(MQTT_TOPICS) / sizeof(MQTT_TOPICS[0]);

static char UNIQUE_SINK_NODE_ID[64];

EspNowReceiver espNowReceiver(WROOM_MAC_ADDRESS);

void espNowCallback(const uint8_t *mac, const uint8_t *data, int len)
{
  uint8_t dataType = data[0];

  switch (dataType)
  {
  case ESP_NOW_ULTRASONIC_SENSOR_DATA_TYPE:
  {
    EspNowUltrasonicSensorData ultrasonicSensorData;
    memcpy(&ultrasonicSensorData, data, sizeof(EspNowUltrasonicSensorData));

    if (ultrasonicSensorData.isClose)
    {
      takePhotoToSupabase(SUPABASE_BUCKET, UNIQUE_SINK_NODE_ID, [](string photoURL, time_t timestamp){
        LogData logData = {PROXIMITY, timestamp, photoURL.c_str()};
        logToFirebase(UNIQUE_SINK_NODE_ID, logData);
      });
    }
    break;
  }
  case ESP_NOW_FINGERPRINT_UPDATE_DATA_TYPE:
  {
    EspNowFingerprintUpdateData fingerprintUpdateData;
    memcpy(&fingerprintUpdateData, data, sizeof(EspNowFingerprintUpdateData));

    if (fingerprintUpdateData.isNew)
    {
      addFingerprintUserToFirebase(UNIQUE_SINK_NODE_ID, fingerprintUpdateData.userId);
    }
    break;
  }
  case ESP_NOW_FINGERPRINT_TOUCH_DATA_TYPE:
  {
    EspNowFingerprintTouchData fingerprintTouchData;
    memcpy(&fingerprintTouchData, data, sizeof(EspNowFingerprintTouchData));

    takePhotoToSupabase(SUPABASE_BUCKET, UNIQUE_SINK_NODE_ID, [=](string photoURL, time_t timestamp){
      LogData logData = {RING_DOORBELL, timestamp, photoURL.c_str(), fingerprintTouchData.userId};
      logToFirebase(UNIQUE_SINK_NODE_ID, logData);
    });

    break;
  }
  }
}

void mqttCallback(char *topic, uint8_t *payload, unsigned int length)
{
  JsonDocument doc;
  deserializeJson(doc, payload, length);

  char *topicPrefix = strcat(UNIQUE_SINK_NODE_ID, "/");
  size_t topicPrefixLen = strlen(topicPrefix);
  if (strncmp(topic, topicPrefix, topicPrefixLen) != 0)
  {
    return;
  }
  topic += topicPrefixLen;

  if (strcmp(topic, BuzzerData::TOPIC) == 0)
  {
    BuzzerData buzzerData = BuzzerData::fromJson(doc);
    beep(BUZZER_PIN, buzzerData.duration);
  }
  else if (strcmp(topic, OledData::TOPIC) == 0)
  {
    OledData oledData = OledData::fromJson(doc);

    EspNowOledData espNowData;
    strcpy(espNowData.message, oledData.message);
    espNowData.isQrCode = oledData.isQrCode;

    espNowReceiver.send((uint8_t *)&espNowData, sizeof(EspNowOledData));
  }
  else if (strcmp(topic, FingerprintData::TOPIC) == 0)
  {
    FingerprintData fingerprintData = FingerprintData::fromJson(doc);

    EspNowFingerprintRegistrationData espNowData;
    strcpy(espNowData.userId, fingerprintData.userId);

    espNowReceiver.send((uint8_t *)&espNowData, sizeof(EspNowFingerprintRegistrationData));
  }
  else if (strcmp(topic, TAKE_PHOTO_TOPIC) == 0)
  {
    takePhotoToSupabase(SUPABASE_BUCKET, UNIQUE_SINK_NODE_ID, [](string photoURL, time_t timestamp){
      LogData logData = {USER_REQUEST, timestamp, photoURL.c_str()};
      logToFirebase(UNIQUE_SINK_NODE_ID, logData);
    });
  }
}

void setup()
{
  Serial.begin(9600);

  Serial.println("Healing...");
  delay(2000);

  pinMode(BUZZER_PIN, OUTPUT);

  Serial.println("Loading WiFi...");
  connectWifi(WIFI_SSID, WIFI_PASSWORD);
  Serial.println("Loading timestamp...");
  configTimestamp();
  Serial.println("Loading camera...");
  loadCamera();
  Serial.println("Loading Firebase...");
  loadFirebase(FIREBASE_API_KEY, FIREBASE_DATABASE_URL);
  Serial.println("Loading Supabase...");
  loadSupabase(SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_USERNAME, SUPABASE_PASSWORD);
  Serial.println("Loading ESP-NOW...");
  loadEspNow(espNowCallback);
  Serial.println("Loading MQTT...");
  loadMQTT(MQTT_SERVER, MQTT_PORT, mqttCallback);

  hashMD5(WiFi.macAddress().c_str(), UNIQUE_SINK_NODE_ID);

  Serial.println("------------------");
  Serial.print("Unique sink node ID: ");
  Serial.println(UNIQUE_SINK_NODE_ID);
  Serial.print("MAC address: ");
  Serial.println(WiFi.macAddress());
  Serial.println("------------------");

  Serial.println("Registering ESP-NOW receiver...");
  delay(1000);
  espNowReceiver.load();

  Serial.println("Ready!");
}

void loop()
{
  loopMQTT(MQTT_USERNAME, MQTT_PASSWORD, MQTT_TOPICS, MQTT_TOPIC_COUNT);
}
