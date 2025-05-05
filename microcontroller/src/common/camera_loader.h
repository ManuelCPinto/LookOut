#ifndef CAMERA_LOADER_H
#define CAMERA_LOADER_H

#include "esp_camera.h"

/**
 * Loads the camera sensor (REQUIRED AT THE START).
 *
 * @return Whether loaded successfully.
 */
bool loadCamera();

/**
 * Takes a photo from the camera sensor.
 *
 * @return The camera frame buffer.
 */
camera_fb_t *takePhoto();

/**
 * Takes a photo from the camera sensor and calls the callback function with the frame buffer (frees the allocated memory at the end).
 *
 * @param callback The callback function to be called with the frame buffer.
 */
void takeSafePhoto(void (*callback)(camera_fb_t*));

#endif