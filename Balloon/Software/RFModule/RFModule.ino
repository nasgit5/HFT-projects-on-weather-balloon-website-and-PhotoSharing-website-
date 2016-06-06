/**
 * HFT BALLOON RADIO MODULE
 * This is the primary system for communication with the ground station.
 * It uses morse encoded signals to transmit telemetry data.
 * You may change the config below, to best fit your needs. The pin configurations are done directly within the modules.
 */


/**
 * Serial debug output configuration
 * DEBUG_<module> enables serial console & debug output for the specified module. This uses 9600 baud serial connection.
 */
//#define DEBUG_SD
//#define DEBUG_HUM
//#define DEBUG_CW
//#define DEBUG_TEMP
//#define DEBUG_PRES
//#define DEBUG_GPS

#define CALLSIGN "SYNC HFTB1"


/**
 * Maximum telemetry string payload length in characters
 */
#define MAX_TELEMETRY_PAYLOAD_LENGTH 100

/**
 * Pressure at sea level in hPa
 */
#define SENSORS_PRESSURE_SEALEVELHPA 1013.25
/**
 * Every N milliseconds the meassured values are transmited via RF link
 */
#define TX_INTERVAL 30000

/**
 * Every N milliseconds the meassured values are stored to SD
 */
#define SD_WRITE_INTERVAL 10000 




// -------------------------------------------------------------------------------------------------------------
// -------------- DON'T CHANGE ANYTHING BELOW THIS LINE UNLESS YOU REALLY KNOW WHAT YOU ARE DOING --------------
// -------------------------------------------------------------------------------------------------------------
#include <SdFat.h>
#include "avr/pgmspace.h"

#include <Wire.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_BMP085_U.h>

#include <SoftwareSerial.h>
#include "TinyGPS.h"


#ifdef DEBUG_SD
	#define INIT_SERIAL
	#define debug_sd(t) {Serial.print("S: ");Serial.println(t);}
#else
	#define debug_sd(t)
#endif

#ifdef DEBUG_CW
	#define INIT_SERIAL
	#define debug_cw(t) {Serial.print("C: ");Serial.println(t);}
#else
	#define debug_cw(t) 
#endif

#ifdef DEBUG_HUM
	#define INIT_SERIAL
	#define debug_hum(t) {Serial.print("H: ");Serial.println(t);}
#else
	#define debug_hum(t) 
#endif

#ifdef DEBUG_TEMP
	#define INIT_SERIAL
	#define debug_temp(t) {Serial.print("T: ");Serial.println(t);}
#else
	#define debug_temp(t) 
#endif

#ifdef DEBUG_PRES
	#define INIT_SERIAL
	#define debug_pres(t) {Serial.print("P: ");Serial.println(t);}
#else
	#define debug_pres(t) 
#endif

#ifdef DEBUG_GPS
	#define INIT_SERIAL
	#define debug_gps(t) {Serial.print("G: ");Serial.println(t);}
#else
	#define debug_gps(t) 
#endif

	
 const char SPACE=' ';
 
// the setup routine runs once when you press reset:
void setup() {

	#ifdef INIT_SERIAL
		Serial.begin(9600);
		while (!Serial) {} //wait for slow boards
		Serial.println("\n\nGO");
	#endif
	gps_setup();

	cw_setup();
	sd_setup();

	temp_setup();

	hum_setup();
	pres_setup();

	cw_tx();
        cw_signal(true);
        delay(5000);
        cw_rx();
}


float lat=0;
float lon=0;
float alt=0;
float spd=0;
float precision=0;


long lastTX=0;
long lastSDWrite=0;


void loop() {
    gps_update();
	
    float vcc=5.2;
    
    float otemp=temp_readSensorOutside();
    float itemp=temp_readSensorInside();
    float pres=pres_readSensor1();
	
    
    
    int humidity=hum_readSensor1();

  
    if(millis()-lastSDWrite >= SD_WRITE_INTERVAL){
      sd_write(lat,lon,alt,0,precision,vcc,otemp,itemp,pres,humidity);
      lastSDWrite=millis();
    }
       
    if(millis()-lastTX >= TX_INTERVAL){
      encodeAndTransmit(lat,lon,alt,precision,vcc,otemp,itemp,pres,humidity);
      lastTX=millis();
    }
        
        
	
}


/**
 * This function encodes and transmits the given data. It will block until the transmission is complete
 */
int sequence=1;
void encodeAndTransmit(const float lat, const float lon, const float alt, const int precision, const float vcc, 
const float otemp, const float itemp, const float pressure, const int humidity){


	char telemetryString[MAX_TELEMETRY_PAYLOAD_LENGTH];

	int pointer=0;
	strcpy(telemetryString,CALLSIGN);
	pointer+=strlen(CALLSIGN);
	telemetryString[pointer++]=SPACE;
	
	
	pointer+=sprintf(telemetryString+pointer,"%d",sequence);
	telemetryString[pointer++]=SPACE;
	
	pointer+=formatFloat(lat,1,5,telemetryString+pointer);
	telemetryString[pointer++]=SPACE;
	
	pointer+=formatFloat(lon,1,5,telemetryString+pointer);
	telemetryString[pointer++]=SPACE;
	
	pointer+=formatFloat(alt,1,1,telemetryString+pointer);
	telemetryString[pointer++]=SPACE;
	
	pointer+=formatFloat(precision,1,1,telemetryString+pointer);
	telemetryString[pointer++]=SPACE;
	
	pointer+=formatFloat(vcc,1,1,telemetryString+pointer);
	telemetryString[pointer++]=SPACE;
	
	pointer+=formatFloat(otemp,1,1,telemetryString+pointer);
	telemetryString[pointer++]=SPACE;
	
	pointer+=formatFloat(itemp,1,1,telemetryString+pointer);
	telemetryString[pointer++]=SPACE;
	
	pointer+=formatFloat(pressure,1,2,telemetryString+pointer);
	telemetryString[pointer++]=SPACE;
	
	pointer+=formatFloat(humidity,1,0,telemetryString+pointer);
	telemetryString[pointer++]=SPACE;
	
	strcpy(telemetryString+pointer,"+");
	
	debug_cw("Transmitting:");
	debug_cw(telemetryString);
    
	cw_transmit(telemetryString);
	
	sequence++;
}

/**
 * Formats the given float with <precision> decimal digits
 * @param num The number to format
 * @param intPrecision The number of digits before the comma
 * @param decPrecision The number of digits after the comma
 * @param buffer OUT the formated string
 * @return The number of chars written
 */
int formatFloat(const float num,const int width,const int precision, char *buffer){
	char tmp[15];
	int length;
	
	dtostrf(num,width,precision,tmp+1);
	tmp[0]='P';
	length=strlen(tmp);
	
	byte offset=(num >= 0 ? 0 : 1);
	strcpy(buffer,tmp+offset);
	return length-offset;
}

/*
int freeRam () {
  extern int __heap_start, *__brkval; 
  int v; 
  int free= (int) &v - (__brkval == 0 ? (int) &__heap_start : (int) __brkval); 
  Serial.print("FREE RAM: ");
  Serial.println(free);
}*/
