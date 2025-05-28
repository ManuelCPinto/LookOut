#ifndef ULTRASONIC_H
#define ULTRASONIC_H

/**
 * Loads the Ultrasonic sensor.
 *
 * @return Whether loaded successfully.
 */
bool loadUltrasonic();

/**
 * Fetches the distance in cm.
 *
 * @return The distance in cm.
 */
float fetchDistance();

#endif
