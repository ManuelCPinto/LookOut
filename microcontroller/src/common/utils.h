#ifndef UTILS_H
#define UTILS_H

/**
 * Generates an MD5 hash from the input string.
 *
 * @param input The input string to hash.
 * @return The MD5 hash as a string.
 */
const char *hashMD5(const char *input);

/**
 * Generates a unique ID from the MAC address.
 *
 * @param macAddress The MAC address to convert.
 * @return The unique ID as a string.
 */
const char *makeMACAsUniqueId(const uint8_t *macAddress);

#endif