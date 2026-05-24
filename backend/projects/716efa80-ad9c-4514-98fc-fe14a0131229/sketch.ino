#include <Servo.h>
Servo myservo;

void setup() {
  myservo.attach(9);
  Serial.begin(9600);
}

void loop() {
  for(int angle = 0; angle <= 180; angle += 10) {
    myservo.write(angle);
    Serial.print("Burchak: ");
    Serial.println(angle);
    delay(200);
  }
  for(int angle = 180; angle >= 0; angle -= 10) {
    myservo.write(angle);
    delay(200);
  }
}