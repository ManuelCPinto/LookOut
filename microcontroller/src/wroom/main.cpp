#include <HardwareSerial.h>
#include <ArduinoJson.h>
#include <common/wifi.h>
#include <common/env/env.h>
#include <common/utils.h>
#include <common/mqtt.h>
#include <common/mqtt_data.h>
#include <common/oled.h>
#include <common/fingerprint.h>
#include <unordered_map>
#undef B1
#include <fmt/core.h>

using namespace std;

String MQTT_TOPICS[] = {
    OledData::TOPIC,
    FingerprintData::TOPIC};
const size_t MQTT_TOPIC_COUNT = sizeof(MQTT_TOPICS) / sizeof(MQTT_TOPICS[0]);
String *fullTopics;

std::unordered_map<int, string> fingerprintUserIds;

void fingerprintCallback(FingerprintStage stage, FingerprintError error)
{
  switch (stage)
  {
  case FINGERPRINT_FIRST_REGISTRATION_STAGE:
    displayText("Place your finger on the sensor...");
    break;
  case FINGERPRINT_REMOVE_FINGER_STAGE:
    displayText("Remove your finger...");
    break;
  case FINGERPRINT_SECOND_REGISTRATION_STAGE:
    displayText("Place the same finger again...");
    break;
  case FINGERPRINT_FINISHED_STAGE:
    displayText("Fingerprint enrolled successfully!", 2000);
    break;
  case FINGERPRINT_ERROR:
    displayText("ERROR", 2000);
    break;
  }
}

void mqttCallback(char *topic, uint8_t *payload, unsigned int length)
{
  JsonDocument doc;
  deserializeJson(doc, payload, length);

  string topicPrefix = string(WROOM_UNIQUE_ID) + "/";
  size_t topicPrefixLen = strlen(topicPrefix.c_str());
  if (strncmp(topic, topicPrefix.c_str(), topicPrefixLen) != 0)
  {
    return;
  }
  topic += topicPrefixLen;

  if (strcmp(topic, OledData::TOPIC) == 0)
  {
    OledData oledData = OledData::fromJson(doc);
    if (oledData.isQrCode)
    {
      displayQRCode(oledData.message);
    }
    else
    {
      displayText(oledData.message);
    }
  }
  else if (strcmp(topic, FingerprintData::TOPIC) == 0)
  {
    FingerprintData fingerprintData = FingerprintData::fromJson(doc);
    switch (fingerprintData.type)
    {
    case FINGERPRINT_REGISTRATION:
      uint16_t id = registerFingerprint(fingerprintCallback);

      if (id > 0)
      {
        bool isNew = fingerprintUserIds.count(id) == 0;
        char allocatedUserId[strlen(fingerprintData.userId) + 1];
        strcpy(allocatedUserId, fingerprintData.userId);
        fingerprintUserIds[id] = string(allocatedUserId);

        FingerprintData newFingerprintData = {FINGERPRINT_UPDATE, fingerprintData.userId, isNew};

        JsonDocument json;
        newFingerprintData.toJson(json);
        uint8_t jsonBuffer[256];
        size_t jsonLen = serializeJson(json, jsonBuffer);

        publishMQTT(string(WROVER_UNIQUE_ID + string("/") + topic).c_str(), jsonBuffer, jsonLen);
      }
      break;
    }
  }
}

void setup()
{
  Serial.begin(9600);

  Serial.println("Healing...");
  delay(2000);

  Serial.println("Loading WiFi...");
  connectWifi(WIFI_SSID, WIFI_PASSWORD);
  Serial.println("Loading timestamp...");
  configTimestamp();
  Serial.println("Loading OLED...");
  loadOLED();
  Serial.println("Loading fingerprint...");
  loadFingerprint();
  Serial.println("Loading MQTT...");
  loadMQTT(MQTT_SERVER, MQTT_PORT, mqttCallback);

  fullTopics = addPrefixToTopics(fmt::format("{}/", WROOM_UNIQUE_ID).c_str(), MQTT_TOPICS, MQTT_TOPIC_COUNT);

  Serial.println("------------------");
  Serial.print("Unique ID: ");
  Serial.println(WROOM_UNIQUE_ID);
  Serial.print("MAC address: ");
  Serial.println(WiFi.macAddress());
  Serial.println("------------------");

  Serial.println("Ready!");
  displayText("Ready!", 2000);
}

void loop()
{
  loopMQTT(WROOM_UNIQUE_ID, MQTT_USERNAME, MQTT_PASSWORD, fullTopics, MQTT_TOPIC_COUNT);

  if (!isFingerprintRegistering)
  {
    int16_t id = scanFingerprint();
    if (id >= 0)
    {
      string fingerprintUserId = fingerprintUserIds[id];

      FingerprintData newFingerprintData = {FINGERPRINT_TOUCH, fingerprintUserId.c_str()};

      JsonDocument json;
      newFingerprintData.toJson(json);
      uint8_t jsonBuffer[256];
      size_t jsonLen = serializeJson(json, jsonBuffer);

      publishMQTT(string(WROVER_UNIQUE_ID + string("/sensor/fingerprint")).c_str(), jsonBuffer, jsonLen);

      displayText(fingerprintUserId == "" ? "Hello!" : string("Hello, " + fingerprintUserId + "!").c_str(), 2000);
    }

    delay(2000);
  }
}
