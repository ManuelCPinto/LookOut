#include <Arduino.h>
#include "ultrasonic.h"

const int TRIG_PORT = 5;
const int ECHO_PORT = 18;

bool loadUltrasonic() {
  pinMode(TRIG_PORT, OUTPUT);
  pinMode(ECHO_PORT, INPUT);
  return true;
}

float fetchDistance() {
  digitalWrite(TRIG_PORT, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PORT, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PORT, LOW);

  long duration = pulseIn(ECHO_PORT, HIGH);

  return duration * 0.034 / 2;
}