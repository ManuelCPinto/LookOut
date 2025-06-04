#ifndef DATABASE_H
#define DATABASE_H

#include <Arduino.h>           
#include <Firebase_ESP_Client.h> 
#include <ArduinoJson.h>        

enum LogType {
  RING_DOORBELL = 0,
  USER_REQUEST = 1,
  PROXIMITY     = 2,
  NEW_FINGERPRINT = 3
};

struct LogData
{
  LogType     type;
  int         createdAt;  
  const char *photoURL;    
  const char *userId;    

  LogData(LogType t,
          int        c = (int)time(NULL),
          const char *p = "",
          const char *u = "")
    : type(t),
      createdAt(c),
      photoURL(p ? p : ""),
      userId((u && u[0] != '\0') ? u : "Anonymous")
  {
  }

  static String toRFC3339(int epoch)
  {
    struct tm tmstruct;
    gmtime_r((time_t *)&epoch, &tmstruct);
    char buf[32];
    sprintf(buf,
            "%04d-%02d-%02dT%02d:%02d:%02dZ",
            tmstruct.tm_year + 1900,
            tmstruct.tm_mon + 1,
            tmstruct.tm_mday,
            tmstruct.tm_hour,
            tmstruct.tm_min,
            tmstruct.tm_sec);
    return String(buf);
  }

  String toJson() const
  {
    StaticJsonDocument<384> root;
    JsonObject fields = root.createNestedObject("fields");
    JsonObject typeObj = fields.createNestedObject("type");
    typeObj["integerValue"] = static_cast<int>(type);
    String ts = toRFC3339(createdAt);
    JsonObject createdObj = fields.createNestedObject("createdAt");
    createdObj["timestampValue"] = ts;
    JsonObject photoObj = fields.createNestedObject("photoURL");
    photoObj["stringValue"] = photoURL ? photoURL : "";
    JsonObject userObj = fields.createNestedObject("userId");
    userObj["stringValue"] = userId;

    String out;
    serializeJson(root, out);
    return out;
  }
};

#endif 
