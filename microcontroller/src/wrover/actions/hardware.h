#ifndef HARDWARE_ACTIONS_H
#define HARDWARE_ACTIONS_H

#include "database.h"

using namespace std;

static const int BUZZER_PIN = 15;
static const int LED_PIN = 2;

/**
 * Beeps the buzzer connected to the specified pin for the given duration.
 *
 * @param duration The duration in milliseconds for which the buzzer should beep.
 */
void beep(uint32_t duration);

/**
 * Takes a photo and uploads it to Supabase.
 *
 * @param bucket The name of the Supabase bucket where the photo will be uploaded.
 * @param folderName The name of the folder in Supabase where the photo will be uploaded.
 * @param callback The callback function to be called when photo is send.
 */
void takePhotoToSupabase(const char *bucket, const char *folderName, function<void(string photoURL, time_t timestamp)> callback);

/**
 * Adds a fingerprint user to Firebase.
 *
 * @param userId The ID of the user to be added.
 * @param nodeId The ID of the node (ESP32) where the user is being added.
 */
void addFingerprintUserToFirebase(const char *nodeId, const char *userId);

/**
 * Logs data to Firebase.
 *
 * @param nodeId The ID of the node (ESP32) where the log is being sent.
 * @param logData The log data to be sent.
 */
void logToFirebase(const char *nodeId, LogData logData);

/**
 * Returns true if /devices/{nodeId}.ownerId is set (non-empty) in Firestore.
 */
bool deviceHasOwner(const char *nodeId);

/**
 * Sends two MQTT‐OLED commands to the Wroom:
 *   1) QR code with the Wrover’s unique ID
 *   2) “Please register via app” text
 */
void showRegistrationPrompt();

/**
 * Sends one MQTT‐OLED command to the Wroom:
 *   “Welcome to Lookout!”
 */
void showWelcome();

void showFingerprintPrompt();
void showRegisterPrompt();

#endif