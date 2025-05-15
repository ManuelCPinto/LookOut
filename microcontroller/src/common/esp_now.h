#ifndef ESP_NOW_H
#define ESP_NOW_H

#include <esp_now.h>
#include <stdexcept>
#include <string.h>

/**
 * Loads ESP-NOW (REQUIRED AT THE START).
 *
 * @return Whether loaded successfully.
 */
bool loadEspNow();

/**
 * Loads ESP-NOW (REQUIRED AT THE START).
 *
 * @param callback The callback function to be called when data is received.
 * @return Whether loaded successfully.
 */
bool loadEspNow(void (*callback)(const uint8_t *mac, const uint8_t *data, int len));

struct EspNowReceiver
{
  uint8_t *macAddress;

  EspNowReceiver(uint8_t *m) : macAddress(m)
  {
    esp_now_peer_info_t peerInfo;
    memcpy(peerInfo.peer_addr, m, 6);
    peerInfo.channel = 0;
    peerInfo.encrypt = false;
    peerInfo.ifidx = WIFI_IF_STA;

    if (esp_now_add_peer(&peerInfo) != ESP_OK)
    {
      throw std::runtime_error("Failed to add peer");
    }
  }

  bool send(uint8_t *data, size_t len)
  {
    esp_err_t result = esp_now_send(macAddress, data, len);
    return result == ESP_OK;
  }
};

#endif
