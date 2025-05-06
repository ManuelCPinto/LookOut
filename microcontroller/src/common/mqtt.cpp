#include <PubSubClient.h>
#include <WiFiClientSecure.h>

WiFiClientSecure espClient;
PubSubClient client(espClient);

void loadMQTT(char *mqttServer, int mqttPort, void (*callback)(char *topic, uint8_t *payload, unsigned int length))
{
  espClient.setInsecure();
  client.setServer(mqttServer, mqttPort);
  client.setCallback(callback);
}

void loopMQTT(char *mqttUser, char *mqttPass, char *mqttTopics[], int topicCount)
{
  while (!client.connected())
  {
    if (client.connect("ESP32Client", mqttUser, mqttPass))
    {
      for (int i = 0; i < topicCount; i++)
      {
        client.subscribe(mqttTopics[i]);
      }
    }
    else
    {
      delay(5000);
    }
  }

  client.loop();
}