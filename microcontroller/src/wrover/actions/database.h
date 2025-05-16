#ifndef DATABASE_H
#define DATABASE_H

#include <Firebase_ESP_Client.h>

enum LogType
{
  USER_REQUEST,
  PROXIMITY,
  RING_DOORBELL
};

struct LogData
{
  static constexpr const char *TOPIC = "sensor/fingerprint";

  enum LogType type;
  int createdAt;
  String photoURL;
  String userId;

  LogData(LogType t, int c, String p, String u = "") : type(t), createdAt(c), photoURL(p), userId(u) {}

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

    String photoURL;
    if (json.get(result, "photoURL") && result.success)
    {
      photoURL = result.stringValue;
    }

    String userId;
    if (json.get(result, "userId") && result.success)
    {
      userId = result.stringValue;
    }

    return {type, createdAt, photoURL, userId};
  }

  void toJson(FirebaseJson json) const
  {
    json.set("type", (int)type);
    json.set("createdAt", createdAt);
    json.set("photoURL", photoURL);
  }
};

#endif
