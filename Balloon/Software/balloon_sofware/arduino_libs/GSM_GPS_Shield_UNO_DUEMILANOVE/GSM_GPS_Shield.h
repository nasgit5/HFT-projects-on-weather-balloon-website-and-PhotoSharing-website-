/*
GSM_GPS_Shield.h - Libary for using the GSM and GPS-Modul on the GSM/GPRS/GPS-Shield Rev.8
Version:     1.5.0
Date:        10.04.2013
Company:     antrax Datentechnik GmbH
*/

#ifndef GSM_GPS_Shield_h
  #if defined(ARDUINO) && ARDUINO >= 100
    // Choose Arduino.h for IDE 1.0
    #include "Arduino.h"
  #else
    // Choose WProgram.h if IDE is older than 1.0
    #include "WProgram.h"
  #endif

  #define GSM_GPS_Shield_h
  
  #include <SPI.h>

  class GSM
  {     
    public:
      GSM(int powerON_pin, int baud);
      void initializeGSM(char pwd[4]);
      void sendSMS(char number[50], char text[180]);
      void makeCall(char number[50]);
    
    private:
      int _powerON_pin; 
      int _baud;
      void readGSMAnswer();
  };
  
  class GPS
  {     
    public:
      GPS(int baud);
      char initializeGPS();
      void getGPS();
      char checkS1();
      char checkS2();
      void setLED(char state);
      char gps_data[80];
      char latitude[20];
      char longitude[20];
      char coordinates[40];
    
    private:
      void WriteByte_SPI_CHIP(char adress, char data);
      char ReadByte_SPI_CHIP(char adress);
      void EnableLevelshifter(char lvl_en_pin);
      void DisableLevelshifter(char lvl_en_pin);
      int _baud;
  };
#endif
