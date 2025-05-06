#include <esp_now.h>
#include <WiFi.h>

bool loadEspNow()
{
  WiFi.mode(WIFI_STA);
  return esp_now_init() == ESP_OK;
}

bool registerReceiver(uint8_t receiverMACaddress[])
{
  esp_now_peer_info_t peerInfo;
  memcpy(peerInfo.peer_addr, receiverMACaddress, 6);
  peerInfo.channel = 0;
  peerInfo.encrypt = false;
  peerInfo.ifidx = WIFI_IF_STA;

  return esp_now_add_peer(&peerInfo) == ESP_OK;
}
