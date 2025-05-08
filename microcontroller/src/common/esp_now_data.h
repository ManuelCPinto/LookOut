#ifndef ESP_NOW_DATA_H
#define ESP_NOW_DATA_H

#include <esp_now.h>

// Warning: The total struct size must not exceed 250 bytes (ESP-NOW packet limit)

#define ESP_NOW_ULTRASONIC_SENSOR_DATA_TYPE 1

typedef struct
{
  uint8_t msgType;
  bool isClose;
} EspNowUltrasonicSensorData;

#endif
