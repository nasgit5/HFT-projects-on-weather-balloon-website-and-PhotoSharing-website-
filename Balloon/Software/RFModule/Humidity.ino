/**
 * Humidity Sensor 1 connection pin
 */
#define HUMIDITY_SENSOR1_PIN A0

void hum_setup(){
	pinMode(HUMIDITY_SENSOR1_PIN,INPUT);
	debug_hum("Humidity initialized");
}

/**
 * Scales analog Read value to percent
 */

int hum_scaleValue(int value){
	return 100.0/1024*value;
}

int hum_readSensor1(){
	int val=analogRead(HUMIDITY_SENSOR1_PIN);
	debug_hum("RAW value Sensor 1:");
	debug_hum(val);
	return hum_scaleValue(val);
}
