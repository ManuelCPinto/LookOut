#include <time.h>
#include <stdio.h>
#include <MD5Builder.h>
#include <common/utils.h>

char *hashMD5(const char *input)
{
  MD5Builder md5;
  md5.begin();
  md5.add(input);
  md5.calculate();

  String result = md5.toString();

  char *output = (char *)malloc(result.length() + 1);
  if (output == nullptr)
    return nullptr;

  strcpy(output, result.c_str());
  return output;
}

char *macToString(uint8_t mac[6])
{
  char *macStr = (char *)malloc(18);
  if (macStr == nullptr)
    return nullptr;

  sprintf(macStr, "%02X:%02X:%02X:%02X:%02X:%02X",
          mac[0], mac[1], mac[2], mac[3], mac[4], mac[5]);

  return macStr;
}

String* addPrefixToTopics(const String& prefix, const String topics[], int numTopics) {
    String* newTopics = new String[numTopics];

    for (int i = 0; i < numTopics; i++) {
        newTopics[i] = prefix + topics[i];
    }

    return newTopics;
}
