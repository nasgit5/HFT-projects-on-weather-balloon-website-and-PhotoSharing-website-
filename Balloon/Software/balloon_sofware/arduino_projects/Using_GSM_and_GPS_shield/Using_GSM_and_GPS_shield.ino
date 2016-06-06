/*
Using_GSM_and_GPS.pde - Example for using the GSM-Modul Rev.8 (without GPS)
Included Functions
Version:     1.5.0
Date:        10.04.2013
Company:     antrax Datentechnik GmbH
Uses with:   Arduino Duemilanove (ATmega328) and
             Arduino UNO (ATmega328)
*/

#if defined(ARDUINO) && ARDUINO >= 100
  // Choose Arduino.h for IDE 1.0
  #include "Arduino.h"
#else
  // Choose WProgram.h if IDE is older than 1.0
  #include "WProgram.h"
#endif

#include <GSM_GPS_Shield.h>
#include <SPI.h>

//GSM gsm(7,9600);                                                                 // (power_pin, baudrate)
GPS gps(9600);                                                                   // (baudrate)

void setup()
{
//  delay(200);
//  gsm.initializeGSM("1204");  
//  
  if(gps.initializeGPS()){
    Serial.println("Initialization completed");
    
    
  }else{
    Serial.println("Initialization can't completed");
  }
}

void loop()
{ 
  delay(300);
  gps.setLED(1);
  delay(500);  
  gps.setLED(0); 
  
  gps.getGPS();
  Serial.println(" -- GPS INFO -- ");
  Serial.print(gps.coordinates);
  Serial.println(gps.gps_data);
  Serial.println("");
//  if(!gps.checkS1())                 
//  {
//    Serial.println("Button 1:");
//    gsm.initializeGSM("1204");                                                   // Enter your SIM-Pin if it's required (Example: "1234") --> the quote signs are important
//    delay(200);
//    //gsm.sendSMS("01726177384","Hello World");                                                // Enter the Destination-Phone-Number (Example: "0176123456789" or "+49176123456789") --> the quote signs are important
//  }
//  if(!gps.checkS2())                 
//  {
//    Serial.println("Button 2:");                             // Enter the Destination-Phone-Number (Example: "0176123456789" or "+49176123456789") --> the quote signs are important
//  }
}


