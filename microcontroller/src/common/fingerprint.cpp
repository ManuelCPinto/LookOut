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
    uint16_t id2 = (((current_free_id - 1) + id) % maxId) + 1; 
    if (finger.loadModel(id2) != FINGERPRINT_OK)
    {
      current_free_id = id2 + 1;
      return id2;
    }
  }

  return -1;
}

uint16_t registerFingerprint2(void (*callback)(FingerprintStage, FingerprintError)) {
  Serial.println("   >> registerFingerprint2()");
  int p = -1;

  uint16_t id = findFreeId();
  Serial.print  ("      findFreeId() -> "); Serial.println(id);
  if (id == 0) {  // or id < 0 depending on your implementation
    Serial.println("      No free slot! Invoking error callback");
    callback(FINGERPRINT_ERROR, FINGERPRINT_STORAGE_FULL_ERROR);
    return 0;
  }

  Serial.println("      Invoking callback: FIRST_REGISTRATION_STAGE");
  callback(FINGERPRINT_FIRST_REGISTRATION_STAGE, FINGERPRINT_NO_ERROR);

  // wait for finger down
  Serial.println("      Waiting for finger image…");
  while ((p = finger.getImage()) != FINGERPRINT_OK) {
    delay(100);
  }
  Serial.println("      Image captured");

  Serial.println("      Converting image to template #1");
  p = finger.image2Tz(1);
  Serial.print  ("      image2Tz(1) -> "); Serial.println(p);
  if (p != FINGERPRINT_OK) {
    Serial.println("      Conversion error, invoking callback");
    callback(FINGERPRINT_ERROR, FINGERPRINT_IMAGE_CONVERSION_ERROR);
    return 0;
  }

  Serial.println("      Invoking callback: REMOVE_FINGER_STAGE");
  callback(FINGERPRINT_REMOVE_FINGER_STAGE, FINGERPRINT_NO_ERROR);
  delay(1000);

  Serial.println("      Waiting for finger removal…");
  while (finger.getImage() != FINGERPRINT_NOFINGER) {
    delay(100);
  }
  Serial.println("      Finger removed");

  Serial.println("      Invoking callback: SECOND_REGISTRATION_STAGE");
  callback(FINGERPRINT_SECOND_REGISTRATION_STAGE, FINGERPRINT_NO_ERROR);

  Serial.println("      Waiting for second finger image…");
  while ((p = finger.getImage()) != FINGERPRINT_OK) {
    delay(100);
  }
  Serial.println("      Second image captured");

  Serial.println("      Converting image to template #2");
  p = finger.image2Tz(2);
  Serial.print  ("      image2Tz(2) -> "); Serial.println(p);
  if (p != FINGERPRINT_OK) {
    Serial.println("      Conversion error on second image");
    callback(FINGERPRINT_ERROR, FINGERPRINT_IMAGE_CONVERSION_ERROR);
    return 0;
  }

  Serial.println("      Creating model");
  p = finger.createModel();
  Serial.print  ("      createModel() -> "); Serial.println(p);
  if (p != FINGERPRINT_OK) {
    Serial.println("      Model creation error");
    callback(FINGERPRINT_ERROR, FINGERPRINT_MODEL_CREATION_ERROR);
    return 0;
  }

  Serial.print  ("      Storing model at slot "); Serial.println(id);
  p = finger.storeModel(id);
  Serial.print  ("      storeModel() -> "); Serial.println(p);
  if (p != FINGERPRINT_OK) {
    Serial.println("      Store error");
    callback(FINGERPRINT_ERROR, FINGERPRINT_STORE_ERROR);
    return 0;
  }

  Serial.println("      Invoking callback: FINISHED_STAGE");
  callback(FINGERPRINT_FINISHED_STAGE, FINGERPRINT_NO_ERROR);
  delay(2000);
  Serial.println("   << registerFingerprint2() success");
  return id;
}

uint16_t registerFingerprint(void (*callback)(FingerprintStage, FingerprintError)) {
  Serial.println(">> registerFingerprint()");
  isFingerprintRegistering = true;
  Serial.print("callback ptr="); 
  Serial.printf("   callback ptr=%p\n", (void*)callback);
  uint16_t id = registerFingerprint2(callback);
  isFingerprintRegistering = false;
  Serial.print  ("<< registerFingerprint() returning "); Serial.println(id);
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