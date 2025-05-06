#ifndef ESP_NOW_H
#define ESP_NOW_H

#include <esp_now.h>

/**
 * Loads ESP-NOW (REQUIRED AT THE START).
 *
 * @return Whether loaded successfully.
 */
bool loadEspNow();

/**
 * Registers a receiver for ESP-NOW.
 *
 * @param receiverMACaddress The MAC address of the receiver.
 * @return Whether registered successfully.
 */
bool registerReceiver(uint8_t receiverMACaddress[]);

#endif
