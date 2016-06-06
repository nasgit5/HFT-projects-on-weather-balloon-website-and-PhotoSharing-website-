/*
GSM_GPS_Shield.cpp - Libary for using the GSM and GPS-Modul on the GSM/GPRS/GPS-Shield Rev.8
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
#include "GSM_GPS_Shield.h"
#include <SPI.h>

// Adresses of the SCI16IS750 registers
#define RHR         0x00 << 3
#define FCR         0x02 << 3
#define LCR         0x03 << 3
#define LSR         0x05 << 3
#define SPR         0x07 << 3
#define IODIR       0x0A << 3
#define IOSTATE     0x0B << 3
#define IOCTL       0x0E << 3

// special registers
#define DLL         0x00 << 3  
#define DLM         0x01 << 3
#define EFR         0x02 << 3
            
// SPI
#define EN_LVL_GPS  10
#define MOSI        11
#define MISO        12
#define SCK         13

// GSM
#define RXD         0
#define TXD         1
#define RING        2
#define CTS         3
#define DTR         4
#define RTS         5
#define DCD         6

int readAnswer = 0;
int state = 0;
int inByte = 0;
int GSM_OK = 0;       
int sim_error = 0;
int reg_OK = 0;
char temp_in[10];                                                                 
                                                                                // Arduino Duemilanove (ATmega328) & Arduino UNO (ATmega328)
GSM::GSM(int powerON_pin, int baud)                                
{              
 pinMode(powerON_pin, OUTPUT);                                                 // Pin 7
  _powerON_pin = powerON_pin;
  _baud = baud;    
  Serial.println(powerON_pin);
  Serial.println(baud);
  pinMode(_powerON_pin, OUTPUT); 
  pinMode(RXD, INPUT);   
  pinMode(TXD, OUTPUT);   
  pinMode(RING, INPUT);   
  pinMode(CTS, INPUT);   
  pinMode(DTR, OUTPUT);   
  pinMode(RTS, OUTPUT);  
  pinMode(DCD, INPUT);      
}

void GSM::initializeGSM(char pwd[20])
{ 
  Serial.println("init GSM");
  Serial.begin(_baud);                                                          // 9600 Baud 
  pinMode(_powerON_pin, OUTPUT);                                                // Pin 7 as Output
  digitalWrite(_powerON_pin, HIGH);                                             // enable Power GSM-Modul
  
  delay(3000);
  state = 0;
  readAnswer=0;
  
  do{
	Serial.print("State: ");
  	Serial.print(state);
	Serial.print(", Answer: ");
  	Serial.println(readAnswer);
    if(readAnswer == 0){
      if(state == 0){  
        inByte=0;
        Serial.println("AT\r");                                                   // send AT  (wake up
        readAnswer = 1;
      } 
      if(state == 1){
        inByte = 0;
        Serial.println("ATE0\r");                                                 // disable Echo   
        readAnswer = 1;
      }
      if(state == 2){
        inByte = 0;
        Serial.println("AT+IPR=9600\r");                                          // set Baudrate
        readAnswer = 1;
      }
      if(state == 3){
        inByte = 0;
        Serial.println("AT#SIMDET=1\r");                                          // set SIM Detection mode  (SIM)       
        readAnswer = 1;
      }
      if(state == 4){
        sim_error = 0;
        inByte = 0;
        delay(1000);
        Serial.println("AT+CPIN?\r");                                             // pin need?   (SIM)      
        readAnswer = 1;
      }
      if(state == 5){
        inByte = 0;
        Serial.println("AT+CPIN=");                                               // enter pin   (SIM)     
        Serial.println(pwd);
        Serial.println("\r");
        readAnswer = 1;
      }
      if(state == 6){
        inByte = 0;   
        reg_OK = 0;
        delay(2000);                                                                                              
        Serial.println("AT+CREG?\r");                                             // Network Registration Report      
        readAnswer = 1;
      }
      if(state == 7){
        inByte = 0;
        Serial.println("AT+CMGF=1\r");                                            // use text-format for sms        
        readAnswer = 1;
      }
    } else {   
      readGSMAnswer();                     
    }
  }
  while(state <= 7);
}

void GSM::sendSMS(char number[50], char text[180])
{
  state = 0;
  readAnswer=0;
  
  do    
    if(readAnswer == 0)
    {            
      if(state == 0)
      {
        inByte = 0;
        Serial.print("AT+CMGS=");                                               // send Message
        Serial.print(number);
        Serial.print(",129\r");                                                 // 129 - number in national format  
                                                                                // --> 145 - number in international 
                                                                                // format (contains the "+")
        readAnswer = 1;
      }
      
      if(state == 1)
      {
        inByte = 0;
        Serial.println("GSM/GPRS/GPS-Shield");
        Serial.println("---GPS---");
        Serial.println(text);                                                   // Message-Text
        Serial.write(26);                                                       // CTRL-Z 
        readAnswer = 1;
      }
    } 
    else
    {   
      readGSMAnswer();                        
    }
  while(state <= 1);  
}
    
void GSM::makeCall(char number[50])
{
  state = 0;
  readAnswer=0;
  
  do    
    if(readAnswer == 0)
    {
      if(state == 0)
      {  
        delay(1000);
        inByte = 0;
        Serial.print("ATD ");                                                   // dial number
        Serial.print(number);
        Serial.print(";\r");
        readAnswer = 1;
      } 
      
      if(state == 1)
      {
        delay(15000);
        inByte = 0;
        Serial.print("ATH\r");                                                  // hang up
        readAnswer = 1;
      }
    } 
    else
    {   
      readGSMAnswer();                        
    }
  while(state <= 1);             
}

void GSM::readGSMAnswer()
{
	Serial.print("Read GSM Answer, "); 
  if(readAnswer == 1){
    inByte = Serial.read();
	Serial.print(inByte);
	Serial.print(", ");
	Serial.print((char(inByte) != ' '));
    if((char(inByte) != ' ')){
      //FIFO GSM-Answer
      temp_in[0] = temp_in[1];
      temp_in[1] = temp_in[2];
      temp_in[2] = temp_in[3];
      temp_in[3] = temp_in[4];
      temp_in[4] = temp_in[5];
      temp_in[5] = temp_in[6];
      temp_in[6] = temp_in[7];
      temp_in[7] = temp_in[8];
      temp_in[8] = temp_in[9];
      temp_in[9] = char(inByte);
    } 
	Serial.print(", temp: ");
	
	for(int i = 0; i < 10; i++){
		Serial.print(temp_in[i]);
		Serial.print("|");
	}
	
    delay(200);
    if((temp_in[8] == 'O')  && (temp_in[9] == 'K')){                             // If answer is OK!
      GSM_OK = 1;
    } else if(temp_in[9] == '>'){                                                  // If answer is >
      GSM_OK = 1;
    } else if((temp_in[5] == 'R')  && (temp_in[6] == 'E')  && (temp_in[7] == 'A') && (temp_in[8] == 'D')  && (temp_in[9] == 'Y')){                       // if SIM is ready no pin is needed
      state = state + 1;   
    } else if((temp_in[4] == 'S') && (temp_in[5] == 'I')  && (temp_in[6] == 'M')  && (temp_in[7] == 'P') && (temp_in[8] == 'U')  && (temp_in[9] == 'K')){                       // if the PUK is needed
      Serial.println("Please enter PUK and new PIN --> PUK,PIN");   
      GSM_OK = 0;
      delay(5000);
      state = 8;                                                                //end of Programm
    }
    else if((temp_in[5] == 'E')  && (temp_in[6] == 'R')  && (temp_in[7] == 'R') && (temp_in[8] == 'O')  && (temp_in[9] == 'R')){
      sim_error = 1;
    }else if((temp_in[7] == '0') && (temp_in[8] == ',')  && (temp_in[9] == '0')){
      reg_OK = 0;
      state = 0;
      readAnswer = 0;    
    } else if((temp_in[7] == '0') && (temp_in[8] == ',')  && (temp_in[9] == '1')){
      reg_OK = 1;   
    }else if((temp_in[7] == '0') && (temp_in[8] == ',')  && (temp_in[9] == '5')){
      reg_OK = 1;    
    }
	
	int available_count = int(Serial.available());
    Serial.print(", serial available before: "); 
    Serial.print(int(Serial.available())); 
	int incomingByte = Serial.read();

	// say what you got:
	Serial.print(", I received: ");
	Serial.print(incomingByte, DEC);
	
    Serial.print(", serial available after: "); 
    Serial.print(int(Serial.available())); 
	
    if(available_count <= 1)
    {
      if((sim_error == 1) && ((state == 4) || (state == 5)))
      {
        GSM_OK = 0;
        Serial.println("ERROR, Attention: Please Check your SIM-PIN and restart the program!");
        delay(5000);
        readAnswer = 0; 
        while(1);
      }      
      if((reg_OK == 0) && (state == 6)){
        GSM_OK = 0;        
        readAnswer = 0;          
      } 
      if(GSM_OK == 1){    
        readAnswer = 0;
        state = state + 1;                                                      // go to next state in current function
        GSM_OK = 0;
        delay(500);
      }
    }
  }
  Serial.print(", GSM OK: "); 
  Serial.print(GSM_OK); 
  Serial.print(", reg OK: ");
  Serial.print(reg_OK); 
  Serial.println(""); 
}              
    
GPS::GPS(int baud)                                                              // With Arduino Duemilanove (ATmega328) & Arduino UNO (ATmega328)
{               
  _baud = baud;    
}

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

  SPCR = (1<<SPE)|(1<<MSTR)|(1<<SPR1)|(1<<SPR0);                                // Initalize the SPI-Interface
  clr_register=SPSR;                                                            // read register to clear them
  clr_register=SPDR;
  delay(10); 
  
  Serial.begin(_baud);
  
  WriteByte_SPI_CHIP(LCR, 0x80);                                                // set Bit 7 so configure baudrate
  WriteByte_SPI_CHIP(DLL, 0x18);                                                // 0x18 = 9600 with Xtal = 3.6864MHz
  WriteByte_SPI_CHIP(DLM, 0x00);                                                // 0x00 = 9600 with Xtal = 3.6864MHz

  WriteByte_SPI_CHIP(LCR, 0xBF);                                                // configure uart
  WriteByte_SPI_CHIP(EFR, 0x10);                                                // activate enhanced registers
  WriteByte_SPI_CHIP(LCR, 0x03);                                                // Uart: 8,1,0
  WriteByte_SPI_CHIP(FCR, 0x06);                                                // Reset FIFO registers
  WriteByte_SPI_CHIP(FCR, 0x01);                                                // enable FIFO Mode   

  // configure GPIO-Ports
  WriteByte_SPI_CHIP(IOCTL, 0x01);                                              // set as GPIO's
  WriteByte_SPI_CHIP(IODIR, 0x04);                                              // set the GPIO directions                                     
  WriteByte_SPI_CHIP(IOSTATE, 0x00);                                            // set default GPIO state

  // Check functionality
  WriteByte_SPI_CHIP(SPR, 'A');                                                 // write an a to register and read it
  test_data = ReadByte_SPI_CHIP(SPR);
  
  if(test_data == 'A')
    return 1;
  else 
    return 0;               
}

void GPS::getGPS()
{ 
  char gps_data_buffer[20];
  char in_data;
  char no_gps_message[22] = "no valid gps signal\r\n";
  int high_Byte;
  int i,j;
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

    
      if((gps_data_buffer[0] == '$') && (gps_data_buffer[1] == 'G') && (gps_data_buffer[2] == 'P') && (gps_data_buffer[3] == 'G') && (gps_data_buffer[4] == 'G')&& (gps_data_buffer[5] == 'A'))
      {
          GPGGA = 1;                                                        
      }
      
      if((GPGGA == 1) && (i < 80))
      {
        if( (gps_data_buffer[0] == 0x0D))                                         // every answer of the GPS-Modul ends with an cr=0x0D
        {    
          i = 80;
          GPGGA = 0;
        }
        else      
        {      
          gps_data[i] = gps_data_buffer[0];                                       // write Buffer into public variable
          i++;
        }
      }
    }      
  }while(i<80) ;
  
  // filter gps data
  
  if(int(gps_data[18]) == 44)
  {
    j = 0;
    for(i = 0; i < 20; i++)
    {
      coordinates[j] = no_gps_message[i];                                       // no gps data available at present!
      j++;      
    }                                    
  }
  else
  {
    j = 0;                                                                      // format latitude   
    for(i = 18; i < 29 ; i++)
    {   
      if(gps_data[i] != ',')
      {
        latitude[j] = gps_data[i];  
        j++;                             
      }        
      
      if(j==2)
      {
       latitude[j] = ' ';
       j++;
      }
    }   
    
    j = 0;
    for(i = 31; i < 42 ; i++)
    {                                                                           // format longitude          
      if(gps_data[i] != ',')
      {
        longitude[j] = gps_data[i];   
        j++;                            
      }   
       
      if(j==2)
      {
        longitude[j] = ' ';
        j++;
      }   
    }   
    
    for(i = 0; i < 40; i++)                                                     // clear coordinates   
      coordinates[i] = ' ';
    
    j = 0;
    for(i = 0; i < 11; i++)                                                     // write gps data to coordinates                                    
    {
      coordinates[j] = latitude[i];
      j++;      
    }
    
    coordinates[j] = ',';
    j++;
    
    coordinates[j] = ' ';
    j++;

    for(i = 0; i < 11; i++)
    {
      coordinates[j] = longitude[i];
      j++;      
    }

    coordinates[j++] = '\r';
    coordinates[j++] = '\n';
    coordinates[j++] = '\0';
  }
}

char GPS::checkS1()
{
  int value;
  value = (ReadByte_SPI_CHIP(IOSTATE) & 0x01);                                  // read S1 button state
  return value;    
}
      
char GPS::checkS2()
{
  int value;
  value = (ReadByte_SPI_CHIP(IOSTATE) & 0x02);                                  // read S2 button state
  return value;
}

void GPS::setLED(char state)
{
  if(state == 0)
    WriteByte_SPI_CHIP(IOSTATE, 0x00);                                          // turn off LED
  else
    WriteByte_SPI_CHIP(IOSTATE, 0x07);                                          // turn on LED
}

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

void GPS::EnableLevelshifter(char lvl_en_pin)
{
  digitalWrite(lvl_en_pin, HIGH);    
}

void GPS::DisableLevelshifter(char lvl_en_pin)
{
  digitalWrite(lvl_en_pin, LOW);     
}



