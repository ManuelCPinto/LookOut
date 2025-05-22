#ifndef UTILS_H
#define UTILS_H

#include <ArduinoJson.h>

using namespace std;

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

#endif