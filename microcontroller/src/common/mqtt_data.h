#ifndef MQTT_DATA_H
#define MQTT_DATA_H

#include <ArduinoJson.h>

struct BuzzerData {
  static constexpr const char* TOPIC = "sensor/buzzer";

  uint32_t duration;

  BuzzerData(uint32_t d) : duration(d) {}

  static BuzzerData fromJson(const JsonDocument& doc) {
    return {
      doc["duration"] | 0
    };
  }

  void toJson() const {
    StaticJsonDocument<200> doc;
    doc["duration"] = duration;
  }
};

const char* TAKE_PHOTO_TOPIC = "sensor/camera/take_photo";

#endif
