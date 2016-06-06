

#define GPS_RX_PIN 6
#define GPS_TX_PIN 7


SoftwareSerial gpsSerial(GPS_RX_PIN, GPS_TX_PIN); // RX, TX
TinyGPS gps;

void gps_setup(){
  gpsSerial.begin(9600);
  debug_gps("i"); 
}

void gps_update(){
 
     
  while(gpsSerial.available()){
    char b=gpsSerial.read();
  

    debug_gps(b);
   
    if(gps.encode(b)){
        
       unsigned long fix_age;
       alt=gps.f_altitude();
       gps.f_get_position(&lat,&lon,&fix_age);
       spd=gps.f_speed_kmph();
       precision=min(99.9,gps.hdop());
       
       
       debug_gps(lat);
      
       debug_gps(lon);
       /*debug_gps("alt");
       debug_gps(alt);
       debug_gps("spd");
       debug_gps(spd);
       debug_gps("prec");
       debug_gps(precision);
       */
     }
      
   }
  
  
}
