#ifndef MQTT_DATA_H
#define MQTT_DATA_H

#include <ArduinoJson.h>

struct BuzzerData
{
private:
  static constexpr const uint32_t DEFAULT_DURATION = 1000;

public:
  static constexpr const char *TOPIC = "sensor/buzzer";

  uint32_t duration = DEFAULT_DURATION;

  BuzzerData(uint32_t d) : duration(d) {}

  static BuzzerData fromJson(const JsonDocument &doc)
  {
    return {
        doc["duration"] | DEFAULT_DURATION};
  }

  void toJson(JsonDocument &doc) const
  {
    doc["duration"] = duration;
  }
};

struct OledData
{
  static constexpr const char *TOPIC = "sensor/oled";

  char *message;
  bool isQrCode;

  OledData(char *m, bool q) : message(m), isQrCode(q) {}

  static OledData fromJson(const JsonDocument &doc)
  {
    return {
        doc["message"] | nullptr,
        doc["isQrCode"] | false};
  }

  void toJson(JsonDocument &doc) const
  {
    doc["message"] = message;
    doc["isQrCode"] = isQrCode;
  }
};

struct FingerprintData
{
  static constexpr const char *TOPIC = "sensor/fingerprint";

  char *userId;

  FingerprintData(char *i) : userId(i) {}

  static FingerprintData fromJson(const JsonDocument &doc)
  {
    return {
        doc["userId"] | nullptr};
  }

  void toJson(JsonDocument &doc) const
  {
    doc["userId"] = userId;
  }
};

const char *TAKE_PHOTO_TOPIC = "sensor/camera/take_photo";

#endif
