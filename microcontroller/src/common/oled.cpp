#include <Adafruit_SSD1306.h>
#include <QRCodeGFX.h>
#include <Wire.h>
#include <Ticker.h>
#include <ArduinoJson.h>
#include <common/oled.h>
#include <common/utils.h>

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define HALF_SCREEN_WIDTH (SCREEN_WIDTH / 2)
#define SDA_PIN 21
#define SCL_PIN 22
#define RESET_PIN -1
#define I2C_ADDRESS 0x3C
#define CHAR_W 6
#define CHAR_H 9

Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, RESET_PIN);
QRCodeGFX qrcode(display);

Ticker displayTimeoutTimer;

void drawTextArea(const char *text, int x, int y, int width, int height)
{
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setTextWrap(false);
  display.setCursor(x, y);

  wrapText(text, x, y, width, height, [=](const char *text, int lineOffset)
           {
    display.println(text);
    display.setCursor(x, y + CHAR_H * lineOffset); });
}

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

void displayText(const char *text, int duration = 0)
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

void displayQRCode(const char *qrCodeMsg, const char *text, int duration = 0)
{
  display.clearDisplay();

  drawTextArea(text, 0, 0, HALF_SCREEN_WIDTH / CHAR_W, SCREEN_HEIGHT / CHAR_H);

  qrcode.setBackgroundColor(WHITE).setScale(2);
  qrcode.generateData(qrCodeMsg);
  qrcode.draw(HALF_SCREEN_WIDTH, 0, false);

  displayTimeoutTimer.detach();
  display.display();

  if (duration > 0)
  {
    displayTimeoutTimer.once_ms(duration, clearDisplay);
  }
}