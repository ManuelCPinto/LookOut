#include <Adafruit_SSD1306.h>
#include <QRCodeGFX.h>
#include <Wire.h>
#include <Ticker.h>

// Configuration for our OLED
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define SDA_PIN 21
#define SCL_PIN 22
#define RESET_PIN -1
#define I2C_ADDRESS 0x3C

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

void displayQRCode(const char *msg, int duration = 0)
{
  display.clearDisplay();

  qrcode.setBackgroundColor(WHITE).setScale(2);
  qrcode.generateData(msg);
  qrcode.draw(0, 0, false);

  displayTimeoutTimer.detach();
  display.display();

  if (duration > 0)
  {
    displayTimeoutTimer.once_ms(duration, clearDisplay);
  }
}
