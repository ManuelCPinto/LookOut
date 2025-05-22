#ifndef ESP_NOW_DATA_H
#define ESP_NOW_DATA_H

#include <esp_now.h>

// Warning: The total struct size must not exceed 250 bytes (ESP-NOW packet limit).
// The first byte of the struct is used to identify the type of data.

typedef enum
{
  ESP_NOW_ULTRASONIC_SENSOR_DATA_TYPE,
  ESP_NOW_OLED_DATA_TYPE,
  ESP_NOW_FINGERPRINT_REGISTRATION_DATA_TYPE,
  ESP_NOW_FINGERPRINT_UPDATE_DATA_TYPE,
  ESP_NOW_FINGERPRINT_TOUCH_DATA_TYPE,
} EspNowDataType;

typedef struct
{
  uint8_t msgType = ESP_NOW_ULTRASONIC_SENSOR_DATA_TYPE;
  bool isClose;
} EspNowUltrasonicSensorData;

typedef struct
{
  uint8_t msgType = ESP_NOW_OLED_DATA_TYPE;
  char message[32];
  bool isQrCode;
} EspNowOledData;

typedef struct
{
  uint8_t msgType = ESP_NOW_FINGERPRINT_REGISTRATION_DATA_TYPE;
  char userId[32];
} EspNowFingerprintRegistrationData;

typedef struct
{
  uint8_t msgType = ESP_NOW_FINGERPRINT_UPDATE_DATA_TYPE;
  char userId[32];
  bool isNew;
} EspNowFingerprintUpdateData;

typedef struct
{
  uint8_t msgType = ESP_NOW_FINGERPRINT_TOUCH_DATA_TYPE;
  char userId[32];
} EspNowFingerprintTouchData;

#endif
