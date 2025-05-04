#ifndef FINGERPRINT_H
#define FINGERPRINT_H

#include <Adafruit_Fingerprint.h>
#include <HardwareSerial.h>

typedef enum
{
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

/**
 * Loads the fingerprint sensor (REQUIRED AT THE START).
 *
 * @return Whether loaded successfully.
 */
bool loadFingerprint();

/**
 * Registers a new fingerprint to the sensor.
 *
 * @param callback A function to call whenever a new fingerprint stage occurs.
 * @return A fingerprint error if any.
 */
FingerprintError registerFingerprint(void (*callback)(FingerprintStage));

/**
 * Scans the fingerprint and returns its ID if valid.
 *
 * @return The fingerprint ID if valid (1-64 for AS608).
 */
uint16_t scanFingerprint();

#endif