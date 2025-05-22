#ifndef DATABASE_H
#define DATABASE_H

#include <Firebase_ESP_Client.h>

enum LogType
{
  USER_REQUEST,
  PROXIMITY,
  RING_DOORBELL,
  NEW_FINGERPRINT
};

struct LogData
{
  static constexpr const char *TOPIC = "sensor/fingerprint";

  enum LogType type;
  int createdAt;
  const char* photoURL;
  const char* userId;

  LogData(LogType t, int c = time(NULL), const char* p = "", const char* u = "") : type(t), createdAt(c), photoURL(p), userId(u) {}

  static LogData fromJson(FirebaseJson &json)
  {
    FirebaseJsonData result;

    LogType type;
    if (json.get(result, "type") && result.success)
    {
      type = (LogType)result.intValue;
    }

    int createdAt;
    if (json.get(result, "createdAt") && result.success)
    {
      createdAt = result.intValue;
    }

    char* photoURL;
    if (json.get(result, "photoURL") && result.success)
    {
      strcpy(photoURL, result.stringValue.c_str());
    }

    char* userId;
    if (json.get(result, "userId") && result.success)
    {
      strcpy(userId, result.stringValue.c_str());
    }

    return {type, createdAt, photoURL, userId};
  }

  void toJson(FirebaseJson &json) const
  {
    json.set("type", (int)type);
    json.set("createdAt", createdAt);
    json.set("photoURL", photoURL);
  }
};

#endif
