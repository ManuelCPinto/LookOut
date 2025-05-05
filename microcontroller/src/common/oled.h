#ifndef OLED_H
#define OLED_H

/**
 * Load the OLED display.
 * 
 * @return Whether loaded successfully.
 */
bool loadOLED();

/**
 * Display a QR code on the OLED display.
 * 
 * @param msg The message to be displayed as a QR code.
 */
void displayQRCode(char *msg);

#endif
