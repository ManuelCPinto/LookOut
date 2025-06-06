#ifndef UTILS_H
#define UTILS_H

#include <ArduinoJson.h>

/**
 * Generates an MD5 hash from the input string.
 *
 * @param input The input string to hash.
 * @return The input as hash.
 */
char *hashMD5(const char *input);

/**
 * Converts MAC address to string.
 * 
 * @param mac The MAC address array to convert.
 * @return The MAC address as string.
*/
char *macToString(uint8_t mac[6]);

/**
 * Adds a prefix to MQTT topic array.
 * 
 * @param The prefix to insert to every topic.
 * @param The MQTT topics.
 * @param The MQTT topic count.
 * @return The array with prefix.
 */
String* addPrefixToTopics(const String& prefix, const String topics[], int numTopics);

/**
 * Wraps text to fit within a specified width and height.
 *
 * @param text The text to wrap.
 * @param x The x-coordinate for the text.
 * @param y The y-coordinate for the text.
 * @param width The maximum width of the text area.
 * @param height The maximum height of the text area.
 * @param callback A function to call with each wrapped line of text.
 */
void wrapText(const std::string &text, int x, int y, int width, int height, std::function<void(const char *text, int lineOffset)> callback);

#endif