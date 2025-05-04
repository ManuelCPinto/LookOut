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

#endif