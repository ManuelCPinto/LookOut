#include <Adafruit_Fingerprint.h>
#include <HardwareSerial.h>
#include "fingerprint.h"

const int RX_PORT = 16;
const int TX_PORT = 17;

const HardwareSerial mySerial(1);
const Adafruit_Fingerprint finger = Adafruit_Fingerprint(&mySerial);

uint16_t current_free_id = 1; // Don't trust this value, it's only for findFreeId() (min value: 1).

bool loadFingerprint()
{
  mySerial.begin(57600, SERIAL_8N1, RX_PORT, TX_PORT);
  finger.begin(57600);

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
    const id2 = (((current_free_id - 1) + id) % maxId) + 1; // Min: 1, Current: current_free_id + 1, Max: maxId

    if (finger.loadModel(id2) != FINGERPRINT_OK)
    {
      current_free_id = id2 + 1;
      return id2;
    }
  }

  return -1;
}

FingerprintError registerFingerprint(void (*callback)(FingerprintStage))
{
  int p = -1;

  uint16_t id = findFreeId();
  if (id < 0)
  {
    return FINGERPRINT_STORAGE_FULL_ERROR;
  }

  callback(FINGERPRINT_FIRST_REGISTRATION_STAGE);
  while (p != FINGERPRINT_OK)
  {
    p = finger.getImage();
    delay(100);
  }

  p = finger.image2Tz(1);
  if (p != FINGERPRINT_OK)
  {
    return FINGERPRINT_IMAGE_CONVERSION_ERROR;
  }

  callback(FINGERPRINT_REMOVE_FINGER_STAGE);
  delay(2000);
  while (finger.getImage() != FINGERPRINT_NOFINGER)
  {
    delay(100);
  }

  callback(FINGERPRINT_SECOND_REGISTRATION_STAGE);
  while ((p = finger.getImage()) != FINGERPRINT_OK)
  {
    delay(100);
  }

  p = finger.image2Tz(2);
  if (p != FINGERPRINT_OK)
  {
    return FINGERPRINT_IMAGE_CONVERSION_ERROR;
  }

  p = finger.createModel();
  if (p != FINGERPRINT_OK)
  {
    return FINGERPRINT_MODEL_CREATION_ERROR;
  }

  p = finger.storeModel(id);
  if (p == FINGERPRINT_OK)
  {
    callback(FINGERPRINT_FINISHED_STAGE);
  }
  else
  {
    return FINGERPRINT_STORE_ERROR;
  }

  return FINGERPRINT_NO_ERROR;
}

uint16_t scanFingerprint()
{
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
  if (p == FINGERPRINT_OK)
  {
    return finger.fingerID;
  }

  return -1;
}