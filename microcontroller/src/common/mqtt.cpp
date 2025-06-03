#include <PubSubClient.h>
#include <WiFiClientSecure.h>

WiFiClientSecure espClient;
PubSubClient client(espClient);

void loadMQTT(const char *mqttServer, int mqttPort, void (*callback)(char *topic, uint8_t *payload, unsigned int length))
{
  espClient.setInsecure();
  client.setServer(mqttServer, mqttPort);
  client.setCallback(callback);
}

void loopMQTT(const char *mqttClientId, const char *mqttUsername, const char *mqttPassword, String mqttTopics[], int topicCount)
{
  while (!client.connected())
  {
    if (client.connect(mqttClientId, mqttUsername, mqttPassword))
    {
      for (int i = 0; i < topicCount; i++)
      {
        client.subscribe(mqttTopics[i].c_str());
      }
    }
    else
    {
      delay(5000);
    }
  }

  client.loop();
}

void publishMQTT(const char *topic, uint8_t *payload, unsigned int length) {
  client.publish(topic, payload, length);
}