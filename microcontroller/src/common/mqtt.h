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
void loopMQTT(const char *mqttUsername, const char *mqttPassword, String mqttTopics[], int topicCount);

/**
 * Publish a message to MQTT.
 * 
 * @param topic The topic to publish the message.
 * @param payload The message payload to publish.
 * @param length The message payload length to publish.
 */
void publishMQTT(const char *topic, uint8_t *payload, unsigned int length);

#endif
