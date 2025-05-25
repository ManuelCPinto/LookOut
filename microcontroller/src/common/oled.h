#ifndef OLED_H
#define OLED_H

/**
 * Load the OLED display.
 *
 * @return Whether loaded successfully.
 */
bool loadOLED();

/**
 * Display text on the OLED display.
 *
 * @param text The text to be displayed.
 * @param duration The duration to display the text (in milliseconds).
 */
void displayText(const char *text, int duration = 0);

/**
 * Display a QR code on the OLED display.
 *
 * @param msg The message to be displayed as a QR code.
 * @param duration The duration to display the QR code (in milliseconds).
 */
void displayQRCode(const char *msg, int duration = 0);

#endif
