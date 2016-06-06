


/*
Connections
   ===========
   Connect SCL to analog 5
   Connect SDA to analog 4
   Connect VDD to 3.3V DC
   Connect GROUND to common ground
*/  
	


Adafruit_BMP085_Unified bmp = Adafruit_BMP085_Unified(10085);


void pres_setup(){
	if(!bmp.begin()){
		debug_pres("Sensor not found");
	} else {
		debug_pres("Initialized");
	}
	
	
}

float pres_readSensor1(){
	debug_pres("Requesting event");
	sensors_event_t event;
	bmp.getEvent(&event);
	if(event.pressure){
		debug_pres("Pressure (hPa): ");
		float pressure=event.pressure;
		
		debug_pres(pressure);

		return pressure;
	} else {
		debug_pres("Sensor error");
	}
	return -1;
}

float pres_getAltitude(const float seaLevelPressure,const float currentPressure,const float temperature){
	bmp.pressureToAltitude(seaLevelPressure,currentPressure,temperature);
}

