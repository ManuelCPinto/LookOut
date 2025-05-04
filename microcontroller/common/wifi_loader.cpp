#include <WiFi.h>
#include "wifi_loader.h"

IPAddress connectWifi(const char *ssid, const char *password)
{
    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED)
    {
        delay(300);
    }
    return WiFi.localIP();
}