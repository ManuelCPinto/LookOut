#include <time.h>
#include <stdio.h>
#include <MD5Builder.h>
#include <common/utils.h>
#include <iostream>
#include <sstream>

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

String *addPrefixToTopics(const String &prefix, const String topics[], int numTopics)
{
  String *newTopics = new String[numTopics];

  for (int i = 0; i < numTopics; i++)
  {
    newTopics[i] = prefix + topics[i];
  }

  return newTopics;
}

void wrapText(const std::string &text, int x, int y, int width, int height, std::function<void(const char *text, int lineOffset)> callback)
{
  std::istringstream stream(text);
  std::string word;
  std::string line;

  int lineOffset = 0;

  while (word != "" || stream >> word)
  {
    std::string word2 = word;

    if (word2.size() > width)
    {
      int remainingLen = width - line.size();
      word = word2.substr(remainingLen);
      word2 = word2.substr(0, remainingLen);
    }

    bool willWordFit = line.size() + word2.size() <= width;

    if (willWordFit)
    {
      line += word2 + " ";
      if (word == word2)
        word = "";
    }

    if (!willWordFit || line.size() >= width)
    {
      callback(line.c_str(), ++lineOffset);
      line = "";

      if (lineOffset == height)
      {
        return;
      }
    }
  }

  if (line.size())
  {
    callback(line.c_str(), lineOffset);
  }
}
