#ifndef FINGERPRINT_H
#define FINGERPRINT_H

#include <Adafruit_Fingerprint.h>
#include <HardwareSerial.h>

typedef enum
{
  FINGERPRINT_ERROR,
  FINGERPRINT_FIRST_REGISTRATION_STAGE,  // "Place your finger on the sensor..."
  FINGERPRINT_REMOVE_FINGER_STAGE,       // "Remove your finger..."
  FINGERPRINT_SECOND_REGISTRATION_STAGE, // "Place the same finger again..."
  FINGERPRINT_FINISHED_STAGE             // "Fingerprint enrolled successfully!"
} FingerprintStage;

typedef enum
{
  FINGERPRINT_NO_ERROR,
  FINGERPRINT_STORAGE_FULL_ERROR,     // "The sensor cannot store more fingerprints..."
  FINGERPRINT_IMAGE_CONVERSION_ERROR, // "Failed to convert image."
  FINGERPRINT_MODEL_CREATION_ERROR,   // "Could not create model."
  FINGERPRINT_STORE_ERROR             // "Failed to store fingerprint."
} FingerprintError;

extern Adafruit_Fingerprint finger;

extern bool isFingerprintRegistering;

/**
 * Loads the fingerprint sensor (REQUIRED AT THE START).
 *
 * @return Whether loaded successfully.
 */
bool loadFingerprint();

/**
 * Finds a free ID for storing the fingerprint in the sensor.
 *
 * @param maxId The maximum ID to check for free space.
 *              Default is the maximum capacity of the sensor.
 * @return The ID if available, -1 if not.
 */
uint16_t findFreeId(uint16_t maxId);

/**
 * Registers a fingerprint and calls the callback function with the current stage or error.
 *
 * @param callback The function to call with the current stage or error.
 * @return The ID of the registered fingerprint.
 */
uint16_t registerFingerprint(void (*callback)(FingerprintStage stage, FingerprintError error));

/**
 * Scans the fingerprint and returns its ID if valid.
 *
 * @return The fingerprint ID if valid (1-64 for AS608).
 */
int16_t scanFingerprint();

#endif