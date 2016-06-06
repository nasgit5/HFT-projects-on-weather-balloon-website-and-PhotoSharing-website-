/*
GPS_Shield.h - Reduced Libary for using only the GPS-Modul on the GSM/GPRS/GPS-Shield Rev.8
It is also rewrote for make the extraction of the GPS Data faster and geting the information in the needed format
Version:     1.0
Date:        17.12.2013
Author:      Frank Holzwarth
University:  HFT Stuttgart
Uses with:   Arduino UNO (ATmega328)
*/

#ifndef GPS_Shield_h
  #if defined(ARDUINO) && ARDUINO >= 100
    // Choose Arduino.h for IDE 1.0
    #include "Arduino.h"
  #else
    // Choose WProgram.h if IDE is older than 1.0
    #include "WProgram.h"
  #endif

  #define GPS_Shield_h
  #include <SPI.h>
  
  class GPS
  {     
    public:
      GPS(int baud);
      char initializeGPS();
      void getGPS();
      boolean checkS1();
      boolean checkS2();
      void setLED(char state);
      char gps_data[80];
	  boolean signal_received;
	  float accuracy;
	  int altitude;
	  float latitude_degree;
	  float longitude_degree;
	  char timeStamp[10];
    
    private:
	  float calcDecimal(float deg, float min);
      void WriteByte_SPI_CHIP(char adress, char data);
      char ReadByte_SPI_CHIP(char adress);
      void EnableLevelshifter(char lvl_en_pin);
      void DisableLevelshifter(char lvl_en_pin);
      int _baud;
  };
#endif
