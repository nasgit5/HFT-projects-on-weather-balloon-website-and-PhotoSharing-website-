/**
* Morse Frequency of the morse beeps in Hz
*/
#define CW_TONE_FREQUENCY 900

/**
* Output modulation on which arduino pin?
*/
#define CW_MODULATION_PIN 9

/**
*WhichpinswitchesTXonandoff?
*/
#define CW_TXRX_PIN 8



//#define TX_INHIBIT

#define DOT_LENGTH 40
#define DASH_LENGTH DOT_LENGTH*3
#define PAUSE_BETWEEN_ELEMENTS DOT_LENGTH
#define PAUSE_BETWEEN_CHARS DOT_LENGTH*3
#define PAUSE_BETWEEN_WORDS DOT_LENGTH*7


prog_char cw_str_A[] PROGMEM =".-";
prog_char cw_str_B[] PROGMEM ="-...";
prog_char cw_str_C[] PROGMEM ="-.-.";
prog_char cw_str_D[] PROGMEM ="-..";
prog_char cw_str_E[] PROGMEM =".";
prog_char cw_str_F[] PROGMEM ="..-.";
prog_char cw_str_G[] PROGMEM ="--.";
prog_char cw_str_H[] PROGMEM ="....";
prog_char cw_str_I[] PROGMEM ="..";
prog_char cw_str_J[] PROGMEM =".---";
prog_char cw_str_K[] PROGMEM ="-.-";
prog_char cw_str_L[] PROGMEM =".-..";
prog_char cw_str_M[] PROGMEM ="--";
prog_char cw_str_N[] PROGMEM ="-.";
prog_char cw_str_O[] PROGMEM ="---";
prog_char cw_str_P[] PROGMEM =".--.";
prog_char cw_str_Q[] PROGMEM ="--.-";
prog_char cw_str_R[] PROGMEM =".-.";
prog_char cw_str_S[] PROGMEM ="...";
prog_char cw_str_T[] PROGMEM ="-";
prog_char cw_str_U[] PROGMEM ="..-";
prog_char cw_str_V[] PROGMEM ="...-";
prog_char cw_str_W[] PROGMEM =".--";
prog_char cw_str_X[] PROGMEM ="-..-";
prog_char cw_str_Y[] PROGMEM ="-.--";
prog_char cw_str_Z[] PROGMEM ="--..";

PROGMEM const char *letters[]={
	cw_str_A,
	cw_str_B,
	cw_str_C,
	cw_str_D,
	cw_str_E,
	cw_str_F,
	cw_str_G,
	cw_str_H,
	cw_str_I,
	cw_str_J,
	cw_str_K,
	cw_str_L,
	cw_str_M,
	cw_str_N,
	cw_str_O,
	cw_str_P,
	cw_str_Q,
	cw_str_R,
	cw_str_S,
	cw_str_T,
	cw_str_U,
	cw_str_V,
	cw_str_W,
	cw_str_X,
	cw_str_Y,
	cw_str_Z,
};


prog_char cw_num_0[] PROGMEM ="-----";
prog_char cw_num_1[] PROGMEM =".----";
prog_char cw_num_2[] PROGMEM ="..---";
prog_char cw_num_3[] PROGMEM ="...--";
prog_char cw_num_4[] PROGMEM ="....-";
prog_char cw_num_5[] PROGMEM =".....";
prog_char cw_num_6[] PROGMEM ="-....";
prog_char cw_num_7[] PROGMEM ="--...";
prog_char cw_num_8[] PROGMEM ="---..";
prog_char cw_num_9[] PROGMEM ="----.";


PROGMEM const char *numbers[]={
	cw_num_0,
	cw_num_1,
	cw_num_2,
	cw_num_3,
	cw_num_4,
	cw_num_5,
	cw_num_6,
	cw_num_7,
	cw_num_8,
	cw_num_9
};

prog_char cw_symb_star[] PROGMEM = "-.-.-";
prog_char cw_symb_plus[] PROGMEM =".-.-.";
prog_char cw_symb_comma[] PROGMEM ="";
prog_char cw_symb_dash[] PROGMEM ="-....-";
prog_char cw_symb_dot[] PROGMEM =".-.-.-";

PROGMEM const char *symbols[]={
	cw_symb_star,
	cw_symb_plus,
	cw_symb_comma,
	cw_symb_dash,
	cw_symb_dot
};


boolean cw_initialized=false;
void cw_setup(){
	cw_initialized=true;
	debug_cw("CW initialized");
};


void cw_tx(){
#ifndef TX_INHIBIT
	digitalWrite(CW_TXRX_PIN,HIGH);
#endif
}

void cw_rx(){
	digitalWrite(CW_TXRX_PIN,LOW);
}

void cw_signal(boolean on){
	if(on){
          analogWrite(CW_MODULATION_PIN,100);
  
		///tone(CW_MODULATION_PIN,CW_TONE_FREQUENCY);
	} else {
          analogWrite(CW_MODULATION_PIN,0);
		//noTone(CW_MODULATION_PIN);
	}
};

void cw_transmit(char *data){
	if(cw_initialized){
		cw_tx();
		//foreachcharacter
		for(int i=0;i < strlen(data);i++){
			char c=data[i];
			
			
			
			//Encoded morse signals
			char enc[8];
			
			if(c >= 65 && c <= 90){//ASCII values A-Z
				strcpy_P(enc,(char*)pgm_read_word(&(letters[c-65])));
			}else if(c >= 97 && c <= 122){//ASCII values a-z
				strcpy_P(enc,(char*)pgm_read_word(&(letters[c-97])));
			}else if(c >= 48 && c <= 57){//ASCII values 0-9
				strcpy_P(enc,(char*)pgm_read_word(&(numbers[c-48])));
			}else if(c >= 42 && c <= 46){//ASCII symbols dash and dot
				strcpy_P(enc,(char*)pgm_read_word(&(symbols[c-42])));
			}
			
			
			if(c == 32) { //space
				delay(PAUSE_BETWEEN_WORDS);
			} else {
				cw_transmit_encoded_morse_char(enc);
				delay(PAUSE_BETWEEN_CHARS);
			}
			
			
			
		}
		cw_rx();
	}
}


void cw_transmit_encoded_morse_char(char *data){
	for(int i=0; i < strlen(data);i++){
		char c=data[i];
		switch(c){
			case '-':
			cw_signal(true);
			delay(DASH_LENGTH);
			cw_signal(false);
			
			break;
			case '.':
			cw_signal(true);
			delay(DOT_LENGTH);
			cw_signal(false);
			break;
		}
		delay(PAUSE_BETWEEN_ELEMENTS);
	}
}
