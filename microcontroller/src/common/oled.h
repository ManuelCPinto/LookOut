#ifndef OLED_H
#define OLED_H

/**
 * Loads the OLED display (REQUIRED AT THE START).
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
 * @param qrCodeMsg The message to be displayed as a QR code.
 * @param text The text to be displayed alongside the QR code.
 * @param duration The duration to display the QR code (in milliseconds).
 */
void displayQRCode(const char *qrCodeMsg, const char *text, int duration = 0);

#endif
