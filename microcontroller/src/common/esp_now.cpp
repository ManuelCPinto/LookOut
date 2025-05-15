#include <esp_now.h>
#include <WiFi.h>

bool loadEspNow()
{
  WiFi.mode(WIFI_STA);
  return esp_now_init() == ESP_OK;
}

bool loadEspNow(void (*callback)(const uint8_t *mac, const uint8_t *data, int len))
{
  return loadEspNow() && esp_now_register_recv_cb(callback) == ESP_OK;
}
