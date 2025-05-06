#include <Adafruit_SSD1306.h>
#include <QRCodeGFX.h>
#include <Wire.h>

// Configuration for our OLED
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define SDA_PIN 21
#define SCL_PIN 22
#define RESET_PIN -1
#define I2C_ADDRESS 0x3C

Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, RESET_PIN);
QRCodeGFX qrcode(display);

bool loadOLED()
{
  Wire.begin(SDA_PIN, SCL_PIN);
  return display.begin(SSD1306_SWITCHCAPVCC, I2C_ADDRESS);
}

void displayText(const char *text)
{
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0, 0);
  display.println(text);
  display.display();
}

void displayQRCode(const char *msg)
{
  display.clearDisplay();

  qrcode.setBackgroundColor(WHITE).setScale(2);
  qrcode.generateData(msg);
  qrcode.draw(0, 0, false);

  display.display();
}
