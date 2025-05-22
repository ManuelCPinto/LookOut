#include <HardwareSerial.h>
#include <common/wifi.h>
#include <common/esp_now.h>
#include <common/env/env.h>
#include <common/esp_now_data.h>
#include <common/oled.h>
#include <common/fingerprint.h>
#include <unordered_map>

using namespace std;

EspNowReceiver espNowReceiver(WROVER_MAC_ADDRESS);

std::unordered_map<int, string> fingerprintUserIds;

void fingerprintCallback(FingerprintStage stage, FingerprintError error)
{
  switch (stage)
  {
  case FINGERPRINT_FIRST_REGISTRATION_STAGE:
    displayText("Place your finger on the sensor...");
    break;
  case FINGERPRINT_REMOVE_FINGER_STAGE:
    displayText("Remove your finger...");
    break;
  case FINGERPRINT_SECOND_REGISTRATION_STAGE:
    displayText("Place the same finger again...");
    break;
  case FINGERPRINT_FINISHED_STAGE:
    displayText("Fingerprint enrolled successfully!", 2000);
    break;
  case FINGERPRINT_ERROR:
    displayText("ERROR", 2000);
    break;
  }
}

void espNowCallback(const uint8_t *mac, const uint8_t *data, int len)
{
  uint8_t dataType = data[0];

  switch (dataType)
  {
  case ESP_NOW_OLED_DATA_TYPE:
  {
    EspNowOledData oledData;
    memcpy(&oledData, data, sizeof(EspNowOledData));

    if (oledData.isQrCode)
    {
      displayQRCode(oledData.message);
    }
    else
    {
      displayText(oledData.message);
    }
    break;
  }
  case ESP_NOW_FINGERPRINT_REGISTRATION_DATA_TYPE:
  {
    EspNowFingerprintRegistrationData fingerprintRegistrationData;
    memcpy(&fingerprintRegistrationData, data, sizeof(EspNowFingerprintRegistrationData));

    uint16_t id = registerFingerprint(fingerprintCallback);

    if (id > 0)
    {
      bool isNew = fingerprintUserIds.count(id) == 0;
      char *allocatedUserId = new char[strlen(fingerprintRegistrationData.userId) + 1];
      strcpy(allocatedUserId, fingerprintRegistrationData.userId);
      fingerprintUserIds[id] = string(allocatedUserId);

      EspNowFingerprintUpdateData espNowData;
      espNowData.isNew = isNew;
      strcpy(espNowData.userId, fingerprintRegistrationData.userId);
      espNowReceiver.send((uint8_t *)&espNowData, sizeof(EspNowFingerprintUpdateData));
    }
    break;
  }
  }
}

void setup()
{
  Serial.begin(9600);

  connectWifi(WIFI_SSID, WIFI_PASSWORD);
  Serial.println("Loading OLED...");
  loadOLED();
  Serial.println("Loading fingerprint...");
  loadFingerprint();
  Serial.println("Loading ESP-NOW...");
  loadEspNow(espNowCallback);

  Serial.println("------------------");
  Serial.print("MAC address: ");
  Serial.println(WiFi.macAddress());
  Serial.println("------------------");

  Serial.println("Loading ESP-NOW receiver...");
  delay(2000);
  espNowReceiver.load();

  Serial.println("Ready!");
  displayText("Ready!", 2000);

  registerFingerprint(fingerprintCallback);
}

void loop()
{
  if (!isFingerprintRegistering)
  {
    uint16_t id = scanFingerprint();
    if (id > 0)
    {
      string fingerprintUserId = fingerprintUserIds[id];

      EspNowFingerprintTouchData fingerprintTouchData;
      strcpy(fingerprintTouchData.userId, fingerprintUserId.c_str());

      espNowReceiver.send((uint8_t *)&fingerprintTouchData, sizeof(EspNowFingerprintTouchData));

      displayText(string("Welcome, " + fingerprintUserId).c_str(), 2000);
    }

    delay(2000);
  }
}
