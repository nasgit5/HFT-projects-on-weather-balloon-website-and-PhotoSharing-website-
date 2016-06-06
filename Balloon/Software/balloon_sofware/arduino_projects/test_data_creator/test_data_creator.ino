/** 
 * Test data generator with configuration parameters to simulate a hole flight of the balloon
 * @author Frank Holzwarth
 *
 * @version 1.0 January 2nd 2013
 */

/* Global output and count pointer */
int pointer;
char testDataOutput[180];

/* Test debug infos on/off */
//#define TestDebug

/* data format, only one simultaneously */
//#define CSVFormat
#define FormatVersion1

/* globale variables of the microcontroller wit start values */
float longitude = 9.000700000f;
float latitude = 48.7000000000f;
float temperatureInside = 12.340f;
float temperatureOutside = -3.450f;
float humidity = 12.340f;
float pressure = 67.8900f;
float batteryLevel = 5.0f;
float precision = 99.9;
int sequenceNumber = 1;
int altitude = 0; // in 10m

/* 
 * Test mode configuration variables and global variables
 * With the configuration variables the test baviour can be controlled
 */

/* config variables of the test flight */
long timeToFinishFlight = 10; // in minutes 80% ascent 20% descent
long maxHeight = 35000; // in meters
float pressureGround = 1013.25f; // in millibar
float pressureSummit = 5.58924f; // in millibar
long outputFrequency = 1000; // in milliseconds
int windVelocityRate = 6; // Beaufort scale
float windVelocityFactor = 1.5f; // bonus for velocity rate if movement is too minimal
float parachuteResistanceDeduction = 0.5f; // the value the resitance of the balloon differs from the parachte
float backupDataDiffer = 1.0; // backup data will differ about this factor (percentage)
/* global variables to perform the flight */
long actualHeight = 0; // in meters, in normal mode from GPS Tracker
long millisToReach = timeToFinishFlight * 60 * 1000; // timefactor
long millisSummit = millisToReach * 0.80f;
float windMin = 0.0f; // wind min of the windlevel
float windMax = 0.0f; // wind max of the windlevel
long WindchangeRate = 10000; // in milliseconds
float WindChangeAngle = 0.0f; // math angle for 360°
float heightFactor = 0; // percentage
unsigned long time = 0; // actual time the micro controller is running
float windAngle = 0.0f; // wind blows in this direction
unsigned int roundsWindBlows = 0; // rounds the wind angle will be changed
boolean descentFlight = false; // is the balloon is in the desenct or ascent phase of the flight
int roundsForPrecision = 0; // How many rounds does the prcision holds

void setup() {
    Serial.begin(9600); // init serial port with 9600 baud
    windConfiguration();
}

void loop() {
    if (time < (millisToReach + outputFrequency)) {
        calculateTestData();
        sendTestData();
    }
}


/* -- serial communication -- */

/**
 * print a new line to serial line
 * Used for a centralized spot to change the output source
 * @param str char array to print
 */
void outputTestData(char str[]) {
    Serial.println(str);
}

/**
 * print to a line without a line break
 * Used for a centralized spot to change the output source
 * @param str char array to print
 */
void printSerial(char str[]) {
    Serial.print(str);
}

/**
 * print csv seperated part of the csv output to the serial port
 * Used for a centralized spot to change the output source
 * @param str char array to print
 */
void addTransmissionCSV(char str[]) {
    strcat(testDataOutput, str);
    strcat(testDataOutput, ";");
}

/**
 * print csv seperated part of the csv output to the serial port
 * last part of the CSV output
 * Used for a centralized spot to change the output source
 * @param str char array to print
 */
void addTransmission(char str[]) {
    strcat(testDataOutput, str);
}

/**
 * Creates the output of the tesdata in the required format
 * The format depends on the defined precompiled annotation
 */
void createTestData() {

    strcpy(testDataOutput, "");

    time = millis();
    long calculatedDelay = (round(time / outputFrequency) * outputFrequency);
    delay(outputFrequency - (time - calculatedDelay));
    time = millis();


#ifdef CSVFormat
    sequenceNumber++;

    char buf[15];
    int accuracy = 3;
    // Min. 6 chars wide incl. decimal point, 2 digits right of decimal
    dtostrf(longitude, 0, 8, buf);
    addTransmissionCSV(buf);
    dtostrf(latitude, 0, 8, buf);
    addTransmissionCSV(buf);
    dtostrf(temperatureInside, 0, accuracy, buf);
    addTransmissionCSV(buf);
    dtostrf(temperatureOutside, 0, accuracy, buf);
    addTransmissionCSV(buf);
    dtostrf(humidity, 0, accuracy, buf);
    addTransmissionCSV(buf);
    dtostrf(pressure, 0, accuracy, buf);
    addTransmissionCSV(buf);
    sprintf(buf, "%lu", time);
    addTransmission(buf);


#else
#endif

#ifdef FormatVersion1

    pointer = 0;
    memset(testDataOutput, 0, 180);

    addIntgerToTransmission(sequenceNumber);
    testDataOutput[pointer++] = ' ';

    pointer += formatFloat(latitude, 2, 6, testDataOutput + pointer);
    testDataOutput[pointer++] = ' ';

    pointer += formatFloat(longitude, 2, 6, testDataOutput + pointer);
    testDataOutput[pointer++] = ' ';

    addIntgerToTransmission(altitude);
    testDataOutput[pointer++] = ' ';

    addIntgerToTransmission((int) (precision));
    testDataOutput[pointer++] = ' ';

    pointer += formatFloat(batteryLevel, 1, 1, testDataOutput + pointer);
    testDataOutput[pointer++] = ' ';

    pointer += formatFloat(temperatureOutside, 1, 1, testDataOutput + pointer);
    testDataOutput[pointer++] = ' ';

    pointer += formatFloat(temperatureInside, 1, 1, testDataOutput + pointer);
    testDataOutput[pointer++] = ' ';

    addIntgerToTransmission((int) pressure);
    testDataOutput[pointer++] = ' ';

    addIntgerToTransmission((int) humidity);
    testDataOutput[pointer++] = ' ';

#else
#endif 
}

/**
 * Formats the integer to the expected aspects (When positiv P before the digit, when negative the minus remains)
 * @param value number to format
 */
void addIntgerToTransmission(int value) {
    if (value >= 0) {
        testDataOutput[pointer++] = 'P';
    }
    pointer += sprintf(testDataOutput + pointer, "%1d", value);

}

/**
 * Formats the given float with <precision> decimal digits
 * @param num The number to format
 * @param decPrecision The number of digits after the comma
 * @param buffer OUT the formated string
 * @return The number of chars written
 */
int formatFloat(const float num, const int width, const int precision, char *buffer) {
    char tmp[15];
    int length;

    dtostrf(num, width, precision, tmp + 1);
    tmp[0] = 'P';
    length = strlen(tmp);

    byte offset = (num >= 0 ? 0 : 1);
    strcpy(buffer, tmp + offset);
    return length - offset;
}

/**
 * Wind velocity scala interpretation, 
 * the given scale value of the beaufort wind scale will give the wind change rate, wind change angle, wind max speed, wind min spped
 */
void windConfiguration() {
    switch (windVelocityRate) {
        case 0:
            WindchangeRate = 40000; // milliseconds
            WindChangeAngle = 5.0f; // Angle that wind will change after the changerate has reached
            windMin = 0.0f; // minimal wind strenght for this wind level
            windMax = 0.2f;
            break;
        case 1:
            WindchangeRate = 35000; // milliseconds
            WindChangeAngle = 7.50f; // Angle that wind will change after the changerate has reached
            windMin = 0.3f; // minimal wind strenght for this wind level
            windMax = 1.5f; // maximum wind strenght for this wind level
            break;
        case 2:
            WindchangeRate = 30000; // milliseconds
            WindChangeAngle = 10.0f; // Angle that wind will change after the changerate has reached
            windMin = 1.6f; // minimal wind strenght for this wind level
            windMax = 3.3f; // maximum wind strenght for this wind level
            break;
        case 3:
            WindchangeRate = 27500; // milliseconds
            WindChangeAngle = 12.5f; // Angle that wind will change after the changerate has reached
            windMin = 3.4f; // minimal wind strenght for this wind level
            windMax = 5.4f; // maximum wind strenght for this wind level
            break;
        case 4:
            WindchangeRate = 25000; // milliseconds
            WindChangeAngle = 15.0f; // Angle that wind will change after the changerate has reached
            windMin = 5.5f; // minimal wind strenght for this wind level
            windMax = 7.9f; // maximum wind strenght for this wind level
            break;
        case 5:
            WindchangeRate = 22500; // milliseconds
            WindChangeAngle = 17.5f;
            windMin = 8.0f; // minimal wind strenght for this wind level
            windMax = 10.7f; // maximum wind strenght for this wind level
            break;
        case 6:
            WindchangeRate = 20000; // milliseconds
            WindChangeAngle = 20.0f; // Angle that wind will change after the changerate has reached
            windMin = 10.8f; // minimal wind strenght for this wind level
            windMax = 13.8f; // maximum wind strenght for this wind level
            break;
        case 7:
            WindchangeRate = 20000; // milliseconds
            WindChangeAngle = 22.5f; // Angle that wind will change after the changerate has reached
            windMin = 13.9f; // minimal wind strenght for this wind level
            windMax = 17.1f; // maximum wind strenght for this wind level
            break;
        case 8:
            WindchangeRate = 17500; // milliseconds
            WindChangeAngle = 25.0f; // Angle that wind will change after the changerate has reached
            windMin = 17.2f; // minimal wind strenght for this wind level
            windMax = 20.7f; // maximum wind strenght for this wind level
            break;
        case 9:
            WindchangeRate = 17500; // milliseconds
            WindChangeAngle = 27.5f; // Angle that wind will change after the changerate has reached
            windMin = 20.8f; // minimal wind strenght for this wind level
            windMax = 24.4f; // maximum wind strenght for this wind level
            break;
        case 10:
            WindchangeRate = 17500; // milliseconds
            WindChangeAngle = 30.0f; // Angle that wind will change after the changerate has reached
            windMin = 24.5f; // minimal wind strenght for this wind level
            windMax = 28.4f; // maximum wind strenght for this wind level
            break;
        case 11:
            WindchangeRate = 15000; // milliseconds
            WindChangeAngle = 17.5f; // Angle that wind will change after the changerate has reached
            windMin = 28.5f; // minimal wind strenght for this wind level
            windMax = 32.6f; // maximum wind strenght for this wind level
            break;
        case 12:
            WindchangeRate = 12500; // milliseconds
            WindChangeAngle = 17.5f; // Angle that wind will change after the changerate has reached
            windMin = 32.7f; // minimal wind strenght for this wind level
            windMax = 56.0f; // maximum wind strenght for this wind level
            break;
        default:;
    }

}

/**
 * main test data create method
 * all used creation methods gathered
 */
void calculateTestData() {
    calculateActuallHeight();
    calculateGPSCoordinates();
    calculateTemperatureInside();
    calculateTemperatureOutside();
    calculateHumidity();
    calculatePressure();
    calculatePrecision();
    calculateBatteryLevel();
}

/**
 * Calculates the next random step GPS Position using the beaufort scale related configuration values
 */
void calculateGPSCoordinates() {

    if (roundsWindBlows == 0) {
        int roundsToGo = WindchangeRate / outputFrequency;
        int minRounds = roundsToGo * 0.75;
        int maxRounds = roundsToGo * 1.25;
        roundsWindBlows = random(minRounds, maxRounds);
        float r = (float) rand() / (float) RAND_MAX;

        float randomCalculatedAngle = WindChangeAngle * r;
        r = (float) rand() / (float) RAND_MAX;
        if (r < 0.5) {
            randomCalculatedAngle = -randomCalculatedAngle;
        }

        windAngle = fmod(randomCalculatedAngle, 360.0f);
        if (windAngle < 0) {
            windAngle = 360 + windAngle;
        }

#ifdef TestDebug
        char buf[15];
        dtostrf(roundsWindBlows, 0, 10, buf);
        outputTestData("Rounds that the Wind blows:");
        outputTestData(buf);
        dtostrf(windAngle, 0, 10, buf);
        outputTestData("Random angle");
        outputTestData(buf);
#else
#endif
    }
    roundsWindBlows--;
    float r = (float) rand() / (float) RAND_MAX;
    float flyVector = (((r * (windMax - windMin)) + windMin)*1000 / outputFrequency) * windVelocityFactor;
    if (descentFlight) {
        flyVector = flyVector * parachuteResistanceDeduction;
    }

    extrapolate(latitude, longitude, windAngle, flyVector);

}

/**
 * Calculates the next point on the GPS grip
 * @param originLat Start GPS latitude of the calculation
 * @param originLon Start GPS longitude of the calculation
 * @param courseToGo The Angle the calculation will go in degrees
 * @param distance The distance the calculation will go in meters
 */
void extrapolate(float originLat, float originLon, float courseToGo, float distance) {

    float DEGREE_DISTANCE_AT_EQUATOR = 111329.0f;
    float EARTH_RADIUS = 6378137.0f;
    float MINUTES_TO_METERS = 1852.0f;
    float DEGREE_TO_MINUTES = 60.0f;

    float crs = toRadians(courseToGo);
    float d12 = toRadians(distance / MINUTES_TO_METERS / DEGREE_TO_MINUTES);
    float lat1 = toRadians(originLat);
    float lon1 = toRadians(originLon);
    float lat = asin(sin(lat1) * cos(d12) + cos(lat1) * sin(d12) * cos(crs));
    float dlon = atan2(sin(crs) * sin(d12) * cos(lat1), cos(d12) - sin(lat1) * sin(lat));
    float lon = fmod((lon1 + dlon + PI), (2 * PI) - PI);

    latitude = toDegree(lat);
    longitude = toDegree(lon);

    // Debug information
#ifdef TestDebug
    char buf[15];
    int accuracy = 20;
    dtostrf(crs, 4, accuracy, buf);
    printSerial("crs ");
    outputTestData(buf);
    dtostrf(d12, 4, accuracy, buf);
    printSerial("d12 ");
    outputTestData(buf);
    dtostrf(lat1, 4, accuracy, buf);
    printSerial("lat1 ");
    outputTestData(buf);
    dtostrf(lon1, 4, accuracy, buf);
    printSerial("lon1 ");
    outputTestData(buf);
    dtostrf(lat, 4, accuracy, buf);
    printSerial("lat ");
    outputTestData(buf);
    dtostrf(dlon, 4, accuracy, buf);
    printSerial("dlon ");
    outputTestData(buf);
    dtostrf(lon, 4, accuracy, buf);
    printSerial("lon ");
    outputTestData(buf);
#else
#endif

}

/**
 * Converts the degree value to radians
 * @param degree The value that will converted to radians
 * @return The value converted to radians
 */
float toRadians(float degree) {
    return degree * PI / 180;
}

/**
 * Converts the radians value to degree
 * @param radian The value that will converted to degree
 * @return The value converted to degree
 */
float toDegree(float radian) {
    return radian * 180 / PI;
}

/**
 * Create the altitude value from the time value
 */
void calculateActuallHeight() {
    if (time < millisSummit) {

        actualHeight = (float) maxHeight * ((float) time / (float) millisSummit);
    } else {
        if (time < millisToReach) {
            // set value if the balloon is going down
            if (!descentFlight) {
                descentFlight = true;
            }
            actualHeight = maxHeight * ((millisToReach - millisSummit)-(time - millisSummit)) / (millisToReach - millisSummit);
        } else {
            actualHeight = 0;
        }
    }
    heightFactor = (float) actualHeight / (float) maxHeight;
    altitude = actualHeight / 10;
}

/**
 * Simulate the inside temperature behavior with binomial equation (0.16x^2-4x+25)
 */
void calculateTemperatureInside() {
    float inputFactor = 25.0f;
    temperatureInside = 0.16 * (heightFactor * inputFactor) * (heightFactor * inputFactor) - 4 * (heightFactor * inputFactor) + 25;
}

/**
 * Simulate the outside temperature behavior with binomial equation (0.35x^2-9x+5)
 */
void calculateTemperatureOutside() {
    float inputFactor = 25.0f;
    temperatureOutside = 0.35 * (heightFactor * inputFactor) * (heightFactor * inputFactor) - 9 * (heightFactor * inputFactor) + 5;
}

/**
 * Simulate the humidity behavior with sine equation (50 * sin(0.1 * x) + 50)
 */
void calculateHumidity() {
    humidity = 50.0f * sin(0.1f * heightFactor * 100.0f) + 50.0f;
}

/**
 * Calculates the presure during the flight
 * linear function to the topvalue multiplied with the height
 */
void calculatePressure() {
    pressure = ((pressureGround - pressureSummit) * (1.0f - heightFactor)) + pressureSummit;
}

/**
 * Some random precision GPS calculation 
 * value holds for some rounds also random calculated
 */
void calculatePrecision() {
    if (roundsForPrecision <= 0) {
        precision = (rand() / (double) RAND_MAX) * 100;
        roundsForPrecision = random(5, 20);
    } else {
        roundsForPrecision--;
    }
}

/**
 * For test data calculation the voltage value of the Arduino port will be read
 */
void calculateBatteryLevel() {
    // read Voltage from analouge port
    batteryLevel = analogRead(A0) * (5.0 / 1023.0);

}

/**
 * Create the test data an print it
 */
void sendTestData() {
    createTestData();
    outputTestData(testDataOutput);
}



