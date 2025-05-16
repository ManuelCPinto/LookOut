#ifndef WIFI_H
#define WIFI_H

#include <WiFi.h>

/**
 * Connects to the WiFi (REQUIRED AT THE START).
 *
 * @param ssid The WiFi SSID to connect.
 * @param password The WiFi password to connect.
 * @return The WiFi IP.
 */
IPAddress connectWifi(const char *ssid, const char *password);

/**
 * Configures the timestamp using NTP servers.
 */
void configTimestamp();

#endif