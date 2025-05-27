#include <Adafruit_SSD1306.h>
#include <QRCodeGFX.h>
#include <Wire.h>
#include <Ticker.h>
#include <ArduinoJson.h>      
#include <common/oled.h>
#include <common/utils.h>

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define SDA_PIN 21
#define SCL_PIN 22
#define RESET_PIN -1
#define I2C_ADDRESS 0x3C
#define TEXT_AREA_W    (SCREEN_WIDTH/2)   
#define CHAR_W           6                
#define CHAR_H           8                
#define MAX_TEXT_CHARS  (TEXT_AREA_W/CHAR_W)       

Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, RESET_PIN);
QRCodeGFX qrcode(display);

Ticker displayTimeoutTimer;

bool loadOLED()
{
  Wire.begin(SDA_PIN, SCL_PIN);
  return display.begin(SSD1306_SWITCHCAPVCC, I2C_ADDRESS);
}

void clearDisplay()
{
  display.clearDisplay();
  display.display();
}

void displayText(const char *text, int duration)
{
  display.clearDisplay();

  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0, 0);
  display.println(text);

  displayTimeoutTimer.detach();
  display.display();

  if (duration > 0)
  {
    displayTimeoutTimer.once_ms(duration, clearDisplay);
  }
}


void displayQRCode(const char *msg, int duration)
{
  StaticJsonDocument<256> jd;
  if (deserializeJson(jd, msg)) return;
  const char *qrData   = jd["qrData"];
  const char *textData = jd["textData"];
  if (!qrData || !textData) return;

  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setTextWrap(false);

  size_t textLen = strlen(textData);
  size_t offset  = 0;
  uint8_t y      = 0;
  char   buf[MAX_TEXT_CHARS + 1];

  while (offset < textLen && y + CHAR_H <= SCREEN_HEIGHT) {
    size_t chunk = textLen - offset;
    if (chunk > MAX_TEXT_CHARS) chunk = MAX_TEXT_CHARS;
    memcpy(buf, textData + offset, chunk);
    buf[chunk] = '\0';            
    display.setCursor(0, y);
    display.print(buf);
    offset += chunk;
    y      += CHAR_H;
  }

  qrcode.setBackgroundColor(WHITE).setScale(2);
  qrcode.generateData(qrData);
  qrcode.draw(TEXT_AREA_W, 0, false);

  display.display();

  displayTimeoutTimer.detach();
  if (duration > 0) displayTimeoutTimer.once_ms(duration, clearDisplay);
}