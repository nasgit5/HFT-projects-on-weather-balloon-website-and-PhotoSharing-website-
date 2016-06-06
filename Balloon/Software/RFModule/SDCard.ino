

// SD chip select pin
const uint8_t chipSelect = SS;

// file system object
SdFat sd;



// store error strings in flash to save RAM
#define error(s) sd.errorHalt_P(PSTR(s))




void sd_setup(){
	
    // initialize the SD card at SPI_HALF_SPEED to avoid bus errors with
    // breadboards.  use SPI_FULL_SPEED for better performance.
	// This has to be done twice, because of some reset issues
	 if (!sd.begin(chipSelect, SPI_HALF_SPEED)){
		 debug_sd("SPI init failed");
		 sd.initErrorHalt();
	 } 
	 delay(400);
	 if (!sd.begin(chipSelect, SPI_HALF_SPEED)){
		 debug_sd("SPI init failed");
		 sd.initErrorHalt();
	 } 

	 debug_sd("SD initialized");
}




void sd_write(const float lat,const float lon,const float alt,const float spd,const float precision,const float vcc,const float otemp,const float itemp,const float pres,const float humidity){
    // filename for this example
    
   const char tab='\t';
  
    debug_sd("write");
      ofstream sdout("data.txt", ios::out | ios::app);
      if (!sdout) debug_sd("open failed");

     
        sdout << millis() << tab << lat << tab << lon << tab << alt << tab << spd << tab << precision << tab << vcc << tab << otemp << tab << itemp << tab << pres << tab << humidity  << endl;
    
      sdout.close();

      //if (!sdout) error("append data failed");

     
   // }

}



