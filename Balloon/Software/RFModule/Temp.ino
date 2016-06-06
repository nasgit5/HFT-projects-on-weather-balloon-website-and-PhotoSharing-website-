#define INSIDE_NTC_PIN A1
#define OUTSIDE_NTC_PIN A2

/**
 * Value of the fixed R in the voltage divider
 */
#define FIXED_R_VALUE 100000

/**
 * NTC resistance @ 25°
 */
#define NTC_25_DEGREE_RESISTANCE 100000

/**
 * Constant "B" (Out of the NTC datasheet)
 */
#define NTC_B 4600


void temp_setup(){
	pinMode(INSIDE_NTC_PIN,INPUT);
	debug_temp("Temperature initialized");
}



float temp_readSensorInside(){
	int rawvalue=analogRead(INSIDE_NTC_PIN);
	float value=temp_convert(rawvalue);
	debug_temp("Inside Temp");
	debug_temp(value);
	return value;
}

float temp_readSensorOutside(){
	int rawvalue=analogRead(OUTSIDE_NTC_PIN);
	float value=temp_convert(rawvalue);
	debug_temp("Outside Temp");
	debug_temp(value);
	return value; 
}


/**
 * This converts a raw analog reading to the temperature in celsius
 */
 
float temp_convert(int rawadc){
	const float kelvinOffset=273.15;
	float r_akt; 
	float temp;
	float result;
	float tn = 25; //base temperature
	tn = tn+kelvinOffset; // convert base temp to kelvin
	r_akt = ((4.64/(4.64/1023*rawadc))*FIXED_R_VALUE)-NTC_25_DEGREE_RESISTANCE; //Calc current resistance
	temp = NTC_B*tn/(NTC_B+log10((r_akt/NTC_25_DEGREE_RESISTANCE))*tn);
	temp = temp - kelvinOffset; //convert result back to celsius
	result =temp;

	return result;
}
