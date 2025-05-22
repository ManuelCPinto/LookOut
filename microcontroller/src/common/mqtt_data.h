#ifndef MQTT_DATA_H
#define MQTT_DATA_H

#include <ArduinoJson.h>

enum FingerprintDataType : int
{
  FINGERPRINT_REGISTRATION = 0,
  FINGERPRINT_UPDATE = 1,
  FINGERPRINT_TOUCH = 2
};

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

  const char *message;
  bool isQrCode;

  OledData(const char *m, bool q) : message(m), isQrCode(q) {}

  static OledData fromJson(const JsonDocument &doc)
  {
    return {
        doc["message"] | "",
        doc["isQrCode"] | false};
  }

  void toJson(JsonDocument &doc) const
  {
    doc["message"] = message;
    doc["isQrCode"] = isQrCode;
  }
};

struct UltrasonicData
{
  static constexpr const char *TOPIC = "sensor/ultrasonic";

  bool isClose;

  UltrasonicData(bool c) : isClose(c) {}

  static UltrasonicData fromJson(const JsonDocument &doc)
  {
    return {
        doc["isClose"] | false};
  }

  void toJson(JsonDocument &doc) const
  {
    doc["isClose"] = isClose;
  }
};

struct FingerprintData
{
  static constexpr const char *TOPIC = "sensor/fingerprint";

  FingerprintDataType type;
  const char *userId;
  bool isNew;

  FingerprintData(FingerprintDataType t, const char *i = "", bool n = false) : type(t), userId(i), isNew(n) {}

  static FingerprintData fromJson(const JsonDocument &doc)
  {
    return {
        static_cast<FingerprintDataType>(doc["type"] | 0),
        doc["userId"] | "",
        doc["isNew"] | false};
  }

  void toJson(JsonDocument &doc) const
  {
    doc["type"] = type;
    doc["userId"] = userId;
    doc["isNew"] = isNew;
  }
};

const char *TAKE_PHOTO_TOPIC = "sensor/camera/take_photo";

#endif
