#ifndef HARDWARE_ACTIONS_H
#define HARDWARE_ACTIONS_H

#include "database.h"

using namespace std;

static const int BUZZER_PIN = 15;

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

#endif