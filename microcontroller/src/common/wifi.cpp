#include <WiFi.h>
#include "wifi.h"

IPAddress connectWifi(const char *ssid, const char *password)
{
    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED)
    {
        delay(300);
    }
    return WiFi.localIP();
}

void configTimestamp()
{
    configTime(0, 0, "pool.ntp.org", "time.nist.gov");
    struct tm timeinfo;
    while (!getLocalTime(&timeinfo))
    {
        delay(1000);
    }
}