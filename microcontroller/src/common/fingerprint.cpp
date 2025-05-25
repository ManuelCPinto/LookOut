#include <Adafruit_Fingerprint.h>
#include <HardwareSerial.h>
#include "fingerprint.h"

const int RX_PORT = 16;
const int TX_PORT = 17;

HardwareSerial mySerial(1);
Adafruit_Fingerprint finger = Adafruit_Fingerprint(&mySerial);

uint16_t current_free_id = 1; // Don't trust this value, it's only for findFreeId() (min value: 1).

bool isFingerprintRegistering = false;

bool loadFingerprint()
{
  mySerial.begin(57600, SERIAL_8N1, RX_PORT, TX_PORT);
  finger.begin(57600);

  finger.emptyDatabase();

  if (finger.verifyPassword())
  {
    return true;
  }
  else
  {
    return false;
  }
}

uint16_t findFreeId(uint16_t maxId = finger.capacity - 1)
{
  if (finger.templateCount >= maxId)
  {
    return -1;
  }

  if (current_free_id > maxId)
  {
    current_free_id = 1;
  }

  for (uint16_t id = 0; id <= maxId; id++)
  {
    uint16_t id2 = (((current_free_id - 1) + id) % maxId) + 1; // Min: 1, Current: current_free_id + 1, Max: maxId

    if (finger.loadModel(id2) != FINGERPRINT_OK)
    {
      current_free_id = id2 + 1;
      return id2;
    }
  }

  return -1;
}

uint16_t registerFingerprint2(void (*callback)(FingerprintStage stage, FingerprintError error))
{
  int p = -1;

  uint16_t id = findFreeId();
  if (id < 0)
  {
    callback(FINGERPRINT_ERROR, FINGERPRINT_STORAGE_FULL_ERROR);
    return 0;
  }

  callback(FINGERPRINT_FIRST_REGISTRATION_STAGE, FINGERPRINT_NO_ERROR);
  while (p != FINGERPRINT_OK)
  {
    p = finger.getImage();
    delay(100);
  }

  p = finger.image2Tz(1);
  if (p != FINGERPRINT_OK)
  {
    callback(FINGERPRINT_ERROR, FINGERPRINT_IMAGE_CONVERSION_ERROR);
    return 0;
  }

  callback(FINGERPRINT_REMOVE_FINGER_STAGE, FINGERPRINT_NO_ERROR);
  delay(1000);
  while (finger.getImage() != FINGERPRINT_NOFINGER)
  {
    delay(100);
  }

  callback(FINGERPRINT_SECOND_REGISTRATION_STAGE, FINGERPRINT_NO_ERROR);
  while ((p = finger.getImage()) != FINGERPRINT_OK)
  {
    delay(100);
  }

  p = finger.image2Tz(2);
  if (p != FINGERPRINT_OK)
  {
    callback(FINGERPRINT_ERROR, FINGERPRINT_IMAGE_CONVERSION_ERROR);
    return 0;
  }

  p = finger.createModel();
  if (p != FINGERPRINT_OK)
  {
    callback(FINGERPRINT_ERROR, FINGERPRINT_MODEL_CREATION_ERROR);
    return 0;
  }

  p = finger.storeModel(id);
  if (p != FINGERPRINT_OK)
  {
    callback(FINGERPRINT_ERROR, FINGERPRINT_STORE_ERROR);
    return 0;
  }

  callback(FINGERPRINT_FINISHED_STAGE, FINGERPRINT_NO_ERROR);
  delay(2000);
  return id;
}

uint16_t registerFingerprint(void (*callback)(FingerprintStage stage, FingerprintError error))
{
  if (isFingerprintRegistering)
    return 0;

  isFingerprintRegistering = true;
  uint16_t id = registerFingerprint2(callback);
  isFingerprintRegistering = false;
  return id;
}

int16_t scanFingerprint()
{
  if (isFingerprintRegistering)
    return -1;

  int p = finger.getImage();
  if (p != FINGERPRINT_OK)
  {
    return -1;
  }

  p = finger.image2Tz();
  if (p != FINGERPRINT_OK)
  {
    return -1;
  }

  p = finger.fingerFastSearch();
  if (p != FINGERPRINT_OK)
  {
    return 0;
  }

  return finger.fingerID;
}