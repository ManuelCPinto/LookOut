#include <HardwareSerial.h>
#include <ArduinoJson.h>
#include <common/wifi_loader.h>
#include <common/camera_loader.h>
#include <common/env/env.h>
#include <common/esp_now.h>
#include <common/mqtt.h>
#include <common/mqtt_data.h>
#include <common/esp_now_data.h>
#include <common/supabase.h>
#include <common/utils.h>
#include "actions.h"

const int BUZZER_PIN = 15;

const char *MQTT_TOPICS[] = {
    BuzzerData::TOPIC,
    TAKE_PHOTO_TOPIC};
const size_t MQTT_TOPIC_COUNT = sizeof(MQTT_TOPICS) / sizeof(MQTT_TOPICS[0]);

char UNIQUE_SINK_NODE_ID[64];

void espNowCallback(const uint8_t *mac, const uint8_t *data, int len)
{
  uint8_t dataType = data[0];

  switch (dataType)
  {
  case ESP_NOW_ULTRASONIC_SENSOR_DATA_TYPE:
  {
    EspNowUltrasonicSensorData ultrasonicSensorData;
    memcpy(&ultrasonicSensorData, data, sizeof(EspNowUltrasonicSensorData));
    // TODO
    break;
  }
  }
}

void mqttCallback(char *topic, uint8_t *payload, unsigned int length)
{
  StaticJsonDocument<200> doc;
  deserializeJson(doc, payload, length);

  if (strcmp(topic, BuzzerData::TOPIC) == 0)
  {
    BuzzerData buzzerData = BuzzerData::fromJson(doc);
    beep(BUZZER_PIN, buzzerData.duration);
  }
  else if (strcmp(topic, TAKE_PHOTO_TOPIC) == 0)
  {
    takePhotoToSupabase(SUPABASE_BUCKET, UNIQUE_SINK_NODE_ID);
  }
}

void setup()
{
  Serial.begin(9600);

  pinMode(BUZZER_PIN, OUTPUT);

  connectWifi(WIFI_SSID, WIFI_PASSWORD);
  configTimestamp();
  loadCamera();
  loadSupabase(SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_USERNAME, SUPABASE_PASSWORD);
  loadEspNow();
  esp_now_register_recv_cb(espNowCallback);
  loadMQTT(MQTT_SERVER, MQTT_PORT, mqttCallback);

  strcpy(UNIQUE_SINK_NODE_ID, hashMD5(WiFi.macAddress().c_str()));
}

void loop()
{
  loopMQTT(MQTT_USERNAME, MQTT_PASSWORD, MQTT_TOPICS, MQTT_TOPIC_COUNT);
}
