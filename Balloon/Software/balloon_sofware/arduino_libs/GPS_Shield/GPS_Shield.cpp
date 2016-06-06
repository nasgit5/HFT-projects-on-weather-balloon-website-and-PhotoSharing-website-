/*
GPS_Shield.cpp - Reduced Libary for using only the GPS-Modul on the GSM/GPRS/GPS-Shield Rev.8
It is also rewrote for make the extraction of the GPS Data faster and geting the information in the needed format
Version:     1.0
Date:        17.12.2013
Author:      Frank Holzwarth
University:  HFT Stuttgart
Uses with:   Arduino UNO (ATmega328)
*/

#if defined(ARDUINO) && ARDUINO >= 100
  // Choose Arduino.h for IDE 1.0
  #include "Arduino.h"
#else
  // Choose WProgram.h if IDE is older than 1.0
  #include "WProgram.h"
#endif
#include "GPS_Shield.h"
#include <SPI.h>

/** Adresses of the SCI16IS750 registers */
#define RHR         0x00 << 3
#define FCR         0x02 << 3
#define LCR         0x03 << 3
#define LSR         0x05 << 3
#define SPR         0x07 << 3
#define IODIR       0x0A << 3
#define IOSTATE     0x0B << 3
#define IOCTL       0x0E << 3

/** special registers */
#define DLL         0x00 << 3  
#define DLM         0x01 << 3
#define EFR         0x02 << 3
            
/** SPI */
#define EN_LVL_GPS  10
#define MOSI        11
#define MISO        12
#define SCK         13

GPS::GPS(int baud) 
{               
  _baud = baud;
      
}

/** set all necessary I/O Pins to run the GPS shield*/
char GPS::initializeGPS()
{
  char test_data = 0;
  char clr_register = 0;
  // set pin's for SPI
  pinMode(MOSI, OUTPUT);
  pinMode(MISO, INPUT);
  pinMode(SCK,OUTPUT);
  pinMode(EN_LVL_GPS,OUTPUT);
  digitalWrite(EN_LVL_GPS,LOW);                                                                                                         

  SPCR = (1<<SPE)|(1<<MSTR)|(1<<SPR1)|(1<<SPR0);   // Initalize the SPI-Interface
  clr_register=SPSR;   // read register to clear them
  clr_register=SPDR;
  delay(10); 
  
  
  WriteByte_SPI_CHIP(LCR, 0x80); // set Bit 7 so configure baudrate
  WriteByte_SPI_CHIP(DLL, 0x18); // 0x18 = 9600 with Xtal = 3.6864MHz
  WriteByte_SPI_CHIP(DLM, 0x00); // 0x00 = 9600 with Xtal = 3.6864MHz
                                                 
  WriteByte_SPI_CHIP(LCR, 0xBF); // configure uart
  WriteByte_SPI_CHIP(EFR, 0x10); // activate enhanced registers
  WriteByte_SPI_CHIP(LCR, 0x03); // Uart: 8,1,0
  WriteByte_SPI_CHIP(FCR, 0x06); // Reset FIFO registers
  WriteByte_SPI_CHIP(FCR, 0x01); // enable FIFO Mode   
                                                   
  // configure GPIO-Ports                          
  WriteByte_SPI_CHIP(IOCTL, 0x01); // set as GPIO's
  WriteByte_SPI_CHIP(IODIR, 0x04); // set the GPIO directions                                     
  WriteByte_SPI_CHIP(IOSTATE, 0x00); // set default GPIO state
                                                   
  // Check functionality                           
  WriteByte_SPI_CHIP(SPR, 'A');    // write an a to register and read it
  test_data = ReadByte_SPI_CHIP(SPR);
  
  if(test_data == 'A')
    return 1;
  else 
    return 0;              
}

/** reads the GPS signal and with a valid GPS signal it will 
*   fill the global varibales that can be read by the main program */
void GPS::getGPS()
{ 
  // clear gps data values accuracy and altitude
  accuracy = 99.99f;
  altitude = -999;
  latitude_degree = 99.99f;
  longitude_degree = 99.99f;
  char first_cache_value_GPS[5];
  char second_cache_value_GPS[12];
  signal_received = false;
  
  // ----------------------------------------------------
  char gps_data_buffer[20];
  char in_data;
  //char no_gps_message[22] = "no valid gps signal\r\n";
  int high_Byte;
  int i,j,k;
  int GPGGA; 
  int Position;  
  
  GPGGA = 0;
  i = 0;
  
  do
  { 
	  
    if(ReadByte_SPI_CHIP(LSR) & 0x01)
    {    
      in_data = ReadByte_SPI_CHIP(RHR);
                    
      // FIFO-System to buffer incomming GPS-Data
      gps_data_buffer[0] = gps_data_buffer[1];
      gps_data_buffer[1] = gps_data_buffer[2];
      gps_data_buffer[2] = gps_data_buffer[3];
      gps_data_buffer[3] = gps_data_buffer[4];
      gps_data_buffer[4] = gps_data_buffer[5];
      gps_data_buffer[5] = gps_data_buffer[6];
      gps_data_buffer[6] = gps_data_buffer[7];
      gps_data_buffer[7] = gps_data_buffer[8];
      gps_data_buffer[8] = gps_data_buffer[9];
      gps_data_buffer[9] = gps_data_buffer[10];
      gps_data_buffer[10] = gps_data_buffer[11];
      gps_data_buffer[11] = gps_data_buffer[12];
      gps_data_buffer[12] = gps_data_buffer[13];
      gps_data_buffer[13] = gps_data_buffer[14];
      gps_data_buffer[14] = gps_data_buffer[15];
      gps_data_buffer[15] = gps_data_buffer[16];
      gps_data_buffer[16] = gps_data_buffer[17];
      gps_data_buffer[17] = gps_data_buffer[18];
      gps_data_buffer[18] = in_data;    

    
      if((gps_data_buffer[0] == '$') && (gps_data_buffer[1] == 'G') 
		  && (gps_data_buffer[2] == 'P') && (gps_data_buffer[3] == 'G') 
			  && (gps_data_buffer[4] == 'G')&& (gps_data_buffer[5] == 'A'))
      {
          GPGGA = 1;                                                        
      }
      
      if((GPGGA == 1) && (i < 80))
      {
        if( (gps_data_buffer[0] == 0x0D)) // every answer of the GPS-Modul ends with an cr=0x0D
        {    
          i = 80;
          GPGGA = 0;
        }
        else      
        {      
          gps_data[i] = gps_data_buffer[0]; // write Buffer into public variable
          i++;
        }
      }
    }      
  }while(i<80) ;
  // filter gps data
  if(int(gps_data[18]) != 44)
  { 
	  signal_received = true;
	  int colonCount = 0;
	  int actual_status = 0;
	  for (int serchColumsI = 0; serchColumsI<80; serchColumsI++ ){
		  // change status when field is done
		if(gps_data[serchColumsI] != ',')
		{		
			switch(actual_status)
			{
				//get time string
				case 1:
					if(j < 6){
						timeStamp[j] = gps_data[serchColumsI];
						j++;
					}
					
				break;	
				// Balloon latitude conversion
			 	case 2:
			 		if(serchColumsI < 20){
						// degree value save to array
			  			first_cache_value_GPS[j] = gps_data[serchColumsI];
			  			j++;
			 		}else{
						// minute value save to array
			  			second_cache_value_GPS[k] = gps_data[serchColumsI];
			  			k++;
			 		}
				break;
				// Balloon lonitude conversion
				case 4:
					if(serchColumsI < 33 && serchColumsI > 30){
						// degree value save to array
						first_cache_value_GPS[j] = gps_data[serchColumsI];
						j++;
					}else{
						// minute value save to array
						second_cache_value_GPS[k] = gps_data[serchColumsI];
						k++;
					}	
				break;
				// save accuracy to cache
				case 8:
					second_cache_value_GPS[j] = gps_data[serchColumsI];
					j++;
				break;
				// save altitude
				case 9:
					second_cache_value_GPS[j] = gps_data[serchColumsI];
					j++;
				break;
			}
			
		}else{
		  // normal field data, handling depends on actual state
			
			// execute transfers from cached chars to double values
			switch(actual_status)
			{
				case 2:
					latitude_degree = calcDecimal(atof(first_cache_value_GPS),atof(second_cache_value_GPS));
				break;
				
				case 4:
					longitude_degree = calcDecimal(atof(first_cache_value_GPS),atof(second_cache_value_GPS));
				break;
				// Saves accuracy 
				case 8:
					accuracy = atof(second_cache_value_GPS);
				break;
				// Saves and convert altitude into 10m format, eg: 1000m over is sealevel is the value of 100 
				case 9:
					float buffer = atof(second_cache_value_GPS)/10;
					if (buffer  > 0.0){
					  altitude = floor(buffer + 0.5);
					}else{
					  altitude = ceil(buffer - 0.5);
				    }
				break;
 
			}
			// cleach save cache, set next state
	        j = 0;
			k = 0;
	  	  	memset(first_cache_value_GPS, 0, sizeof first_cache_value_GPS);
	  	  	memset(second_cache_value_GPS, 0, sizeof second_cache_value_GPS);
			actual_status++;
		}
	  }
  }
}
/** checks if button 1 of the shield is pushed
* @ return true or 1 if it is set
*/
boolean GPS::checkS1()
{
  char value;
  value = (ReadByte_SPI_CHIP(IOSTATE) & 0x01); // read S1 button state
  return !value;    
}

/** checks if button 2 of the shield is pushed
* @ return true or 1 if it is set
*/
boolean GPS::checkS2()
{
  char value;
  value = (ReadByte_SPI_CHIP(IOSTATE) & 0x02); // read S2 button state
  return !value;
}

/** set the GPS related LED on and off (1/0)*/
void GPS::setLED(char state)
{
  if(state == 0)
    WriteByte_SPI_CHIP(IOSTATE, 0x00); // turn off LED
  else
    WriteByte_SPI_CHIP(IOSTATE, 0x07); // turn on LED
}


/** Calc decimal version of GPS Signal of an degree and minute format
* @param deg degree value of the GPS signal
* @param min minute value of the GPS signal
* @ return new calculated GPS degree-only value
*/
float GPS::calcDecimal(float deg, float min){

	return deg*1.0 + (min/60.0);
}

/** */
void GPS::WriteByte_SPI_CHIP(char adress, char data)
{
  char databuffer[2];
  int i;
  
  databuffer[0] = adress;
  databuffer[1] = data;
  
  EnableLevelshifter(EN_LVL_GPS);                                               // enable GPS-Levelshifter and pull CS-line low
  
  for(i = 0; i < 2; i++)
    SPI.transfer(databuffer[i]);                                                // write data
       
  DisableLevelshifter(EN_LVL_GPS);                                              // disable GPS-Levelshifter and release CS-Line                 
}

/** */
char GPS::ReadByte_SPI_CHIP(char adress)
{
  char incomming_data;

  adress = (adress | 0x80);
  
  EnableLevelshifter(EN_LVL_GPS);                                               // enable GPS-Levelshifter and pull CS-line low
  
  SPI.transfer(adress);
  incomming_data = SPI.transfer(0xFF);
  
  DisableLevelshifter(EN_LVL_GPS);                                              // disable GPS-Levelshifter and release CS-Line

  return incomming_data;     
}

/** */
void GPS::EnableLevelshifter(char lvl_en_pin)
{
  digitalWrite(lvl_en_pin, HIGH);    
}

/** */
void GPS::DisableLevelshifter(char lvl_en_pin)
{
  digitalWrite(lvl_en_pin, LOW);     
}



