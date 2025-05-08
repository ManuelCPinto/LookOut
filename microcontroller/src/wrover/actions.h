#ifndef ACTIONS_H
#define ACTIONS_H

#include <Arduino.h>

/**
 * Beeps the buzzer connected to the specified pin for the given duration.
 *
 * @param pin The GPIO pin number where the buzzer is connected.
 * @param duration The duration in milliseconds for which the buzzer should beep.
 */
void beep(uint8_t pin, uint32_t duration);

/**
 * Takes a photo and uploads it to Supabase.
 *
 * @param bucket The name of the Supabase bucket where the photo will be uploaded.
 * @param folderName The name of the folder in Supabase where the photo will be uploaded.
 */
void takePhotoToSupabase(const char *bucket, const char *folderName);

#endif