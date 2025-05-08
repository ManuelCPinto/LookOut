#ifndef MQTT_H
#define MQTT_H

#include <PubSubClient.h>

/**
 * Loads the MQTT client (REQUIRED AT THE START).
 *
 * @param mqttServer The MQTT server address.
 * @param mqttPort The MQTT server port.
 * @param callback A function to call whenever a new message arrives.
 */
void loadMQTT(const char *mqttServer, int mqttPort, void (*callback)(char *topic, uint8_t *payload, unsigned int length));

/**
 * Loops the MQTT client (REQUIRED IN THE LOOP).
 *
 * @param mqttUsername The MQTT username.
 * @param mqttPassword The MQTT password.
 * @param mqttTopics The MQTT topics to subscribe to.
 * @param topicCount The number of topics to subscribe to.
 */
void loopMQTT(const char *mqttUsername, const char *mqttPassword, const char *mqttTopics[], int topicCount);

#endif
