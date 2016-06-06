/** Software for the Arduino GPS and backup module
*
* @author Frank Holzwarth
*
* @version 1.0 December 15th 2013
*/
#include <GPS_Shield.h>
#include <SPI.h>

/** -- global variables --  */

/** Initialisation of the library classes */
GPS gps(9600);

/** data variables for serial output */
int const MAX_LENGTH_SERIAL_COMMUNICATION = 30;
int pointer;
char serialSequence[MAX_LENGTH_SERIAL_COMMUNICATION];

/** data variables of the microcontroller (output)*/
float longitude =   9.000700000f;
float latitude =  48.7000000000f;
float accuracy = 99.9;
int altitude = 0; // in 10m
char *timeStamp = "999999";
// the setup routine runs once when you press reset:
void setup() {
    Serial.begin(9600);
    if(gps.initializeGPS()){
        Serial.println("Initialization completed");
        }else{
        Serial.println("Initialization can't completed");
    }
}
void loop() {
    gps.setLED(1);
    gps.getGPS();
    receiveGPSData();
    gps.setLED(0);
    delay(100);
    sendData();
}
/** collecting GPS data from the library and add it to global variables */
void receiveGPSData(void){
    gps.getGPS();
    altitude = gps.altitude; // in 10m
    longitude =   gps.latitude_degree;
    latitude = gps.longitude_degree;
    accuracy = gps.accuracy;
}
/** Send Data via serial communication to the main arduino */
void sendData(){
    crateSerialSequenceInteger('A',altitude);
    crateSerialSequenceInteger('P',accuracy);
    crateSerialSequenceGPS('G',2,6,longitude,latitude);
}
/**
* Output of the float values of the GPS cordinates to the defined serial interface (can be changed in function printSerialLn)
* @param indentifier The character that descripes the value types
* @param width The number of digits before the comma of both values
* @param precision The number of digits after the comma of both values
* @param longitude GPS longitude coordinate
* @param latitude GPS latitude coordinate
*/
void crateSerialSequenceGPS(char indentifier, int width, int precision, float longitude, float latitude){
    pointer=0;
    memset(serialSequence, 0, MAX_LENGTH_SERIAL_COMMUNICATION);
    serialSequence[pointer++]=indentifier;
    serialSequence[pointer++]=' ';
    pointer+=formatFloat(longitude,width,precision,serialSequence+pointer);
    serialSequence[pointer++]=' ';
    pointer+=formatFloat(latitude,width,precision,serialSequence+pointer);
    printSerialLn(serialSequence);
}
/**
* Formats the given float with <precision> decimal digits
* @param num The number to format
* @param width The number of digits before the comma
* @param precision The number of digits after the comma
* @param buffer OUT the formated string
* @return The number of chars written
*/
int formatFloat(const float num,const int width,const int precision, char *buffer){
    char tmp[15];
    int length;
    dtostrf(num,width,precision,tmp);
    length=strlen(tmp);
    byte offset=(num >= 0 ? 0 : 1);
    strcpy(buffer,tmp+offset);
    return length-offset;
}
/**
* Output of an intager value to the defined serial interface (can be changed in function printSerialLn)
* @param indentifier The character that descripes the value type 
* @param value The integer number associated to the sending value
*/
void crateSerialSequenceInteger(char indentifier, int value){
    pointer=0;
    memset(serialSequence, 0, MAX_LENGTH_SERIAL_COMMUNICATION);
    serialSequence[pointer++]=indentifier;
    serialSequence[pointer++]=' ';
    pointer+=sprintf(serialSequence+pointer,"%1d",value);
    printSerialLn(serialSequence);
}
/** centralized serial communication: print a new line to serial line */
void printSerialLn(char str[]){
    Serial.println(str);
}
/** centralized serial communication: print chars to serial line */
void printSerial(char str[]){
    Serial.print(str);
}
