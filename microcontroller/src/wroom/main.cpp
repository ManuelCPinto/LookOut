#include <HardwareSerial.h>
#include <ArduinoJson.h>
#include <common/wifi.h>
#include <common/env/env.h>
#include <common/utils.h>
#include <common/mqtt.h>
#include <common/mqtt_data.h>
#include <common/oled.h>
#include <common/fingerprint.h>
#include <common/ultrasonic.h>
#include <unordered_map>
#undef B1
#include <fmt/core.h>
#include <Ticker.h>

using namespace std;

static const int MAX_ULTRASONIC_DISTANCE = 10;
static volatile bool isSomeoneClose = false;
static volatile bool initialOledReceived = false;

struct CompositeOled
{
  String layout;
  String qrData;
  String textData;
  static CompositeOled fromJson(const JsonDocument &d)
  {
    CompositeOled c;
    c.layout = d["layout"].as<String>();
    c.qrData = d["qrData"].as<String>();
    c.textData = d["textData"].as<String>();
    return c;
  }
};

String MQTT_TOPICS[] = {
    OledData::TOPIC,
    FingerprintData::TOPIC};
const size_t MQTT_TOPIC_COUNT = sizeof(MQTT_TOPICS) / sizeof(MQTT_TOPICS[0]);
String *fullTopics;

std::unordered_map<int, string> fingerprintUserIds;

Ticker fingerprintIntervalTimer;
Ticker ultrasonicIntervalTimer;

void fingerprintCallback(FingerprintStage stage, FingerprintError error)
{
  switch (stage)
  {
  case FINGERPRINT_FIRST_REGISTRATION_STAGE:
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
    initialOledReceived = true;
    JsonDocument doc;
    DeserializationError err = deserializeJson(doc, payload, length);
    if (!err)
    {
      if (doc.containsKey("layout"))
      {
        const char *qrData = doc["qrData"] | "";
        const char *textData = doc["textData"] | "";
        int duration = doc["duration"] | 0;
        displayQRCode(qrData, textData, duration);
      }
      else if (doc.containsKey("message"))
      {
        const char *msg = doc["message"] | "";
        int duration = doc["duration"] | 0;
        displayText(msg, duration);
      }
    }
    return;
  }
  else if (strcmp(topic, FingerprintData::TOPIC) == 0)
  {
    FingerprintData fingerprintData = FingerprintData::fromJson(doc);
    switch (fingerprintData.type)
    {
    case FINGERPRINT_REGISTRATION:
      Serial.println("[MQTT] Received FINGERPRINT_REGISTRATION");
      Serial.print  ("[MQTT] Calling registerFingerprint()… ");
      uint16_t id = registerFingerprint(fingerprintCallback);
      Serial.print  ("[MQTT] registerFingerprint() returned ID=");
      Serial.println(id);
      Serial.println("[MQTT] After registerFingerprint()");
      if (id > 0)
      {
         Serial.println("[MQTT] id > 0, proceeding to send update");
          bool isNew = fingerprintUserIds.count(id) == 0;
          char allocatedUserId[strlen(fingerprintData.userId) + 1];
          strcpy(allocatedUserId, fingerprintData.userId);
          fingerprintUserIds[id] = string(allocatedUserId);

          FingerprintData newFingerprintData = {
            FINGERPRINT_UPDATE,
            fingerprintData.userId,
            isNew
          };

          // Serialize to JSON
          StaticJsonDocument<256> jsonDoc;
          newFingerprintData.toJson(jsonDoc);
          char jsonOut[256];
          size_t jsonLen = serializeJson(jsonDoc, jsonOut, sizeof(jsonOut));

          // Build topic
          String topicStr = String(WROVER_UNIQUE_ID) + String("/") + String(FingerprintData::TOPIC);

          // Debug prints
          Serial.print("[MQTT] Publishing to topic: ");
          Serial.println(topicStr);
          Serial.print("[MQTT] Payload (len=");
          Serial.print(jsonLen);
          Serial.print("): ");
          Serial.println(jsonOut);

          // Actually publish
          publishMQTT(topicStr.c_str(), (uint8_t*)jsonOut, jsonLen);
          Serial.println("[MQTT] publishMQTT() called");
      } else {
        Serial.println("[MQTT] id == 0, registration failed or cancelled");
      }
      break;
    }
  }
}

void loopScanFingerprint()
{
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
  }
}

void loopUltrasonicSensor()
{
  float distance = fetchDistance();
  if (distance < 0) {
    Serial.println("Distance: no echo");
  } else {
    Serial.printf("Distance: %.1f cm\n", distance);
  }
  Serial.printf("Max Distance: %d cm\n", MAX_ULTRASONIC_DISTANCE);
  Serial.printf("isSomeoneClose: %s\n\n", (distance>0 && distance <= MAX_ULTRASONIC_DISTANCE) ? "true":"false");

  if (distance <= MAX_ULTRASONIC_DISTANCE && !isSomeoneClose)
  {
    isSomeoneClose = true;
    UltrasonicData newFingerprintData = {true};

    JsonDocument json;
    newFingerprintData.toJson(json);
    uint8_t jsonBuffer[256];
    size_t jsonLen = serializeJson(json, jsonBuffer);

    publishMQTT(string(WROVER_UNIQUE_ID + string("/sensor/ultrasonic")).c_str(), jsonBuffer, jsonLen);
  }
  else
  {
    isSomeoneClose = false;
  }
  delay(500);
}

void setup()
{
  Serial.begin(9600);
  Serial.println("Loading WiFi...");
  connectWifi(WIFI_SSID, WIFI_PASSWORD);
  Serial.println("Loading timestamp...");
  configTimestamp();
  Serial.println("Loading OLED...");
  loadOLED();
  Serial.println("Loading fingerprint...");
  loadFingerprint();
  Serial.println("Loading ultrasonic...");
  loadUltrasonic();
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
  int dotCount = 0;
  while (!initialOledReceived)
  {
    char buf[16];
    int dots = dotCount % 4;
    snprintf(buf, sizeof(buf), "Loading%.*s", dots, "...");
    displayText(buf, 0);

    unsigned long start = millis();
    while (millis() - start < 500)
    {
      loopMQTT(
          WROOM_UNIQUE_ID,
          MQTT_USERNAME,
          MQTT_PASSWORD,
          fullTopics,
          MQTT_TOPIC_COUNT);
      delay(20);
    }
    dotCount++;
  }  
  
  fingerprintIntervalTimer.attach_ms(2000, loopScanFingerprint);
  ultrasonicIntervalTimer.attach_ms(2000, loopUltrasonicSensor);
}

void loop()
{
  loopMQTT(WROOM_UNIQUE_ID, MQTT_USERNAME, MQTT_PASSWORD, fullTopics, MQTT_TOPIC_COUNT);
}
