/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

package decoders.Filters;

import java.io.FilterOutputStream;
import java.io.IOException;
import java.io.OutputStream;

/**
 * Stream that converts analogue signals into digital values 
 * High = Integer.MAX_VALUE
 * Low = Integer.MIN_VALUE
 * 
 * @author Michael Kolb 
 */
public class AnalogDigitalConverterStream extends FilterOutputStream {

    public final int THRESHOLD;
    
    /**
     * Constructor
     * @param out Next stream in chain
     * @param threshold Border from HIGH to LOW. If received value >=threshold -> HIGH, value < threshold -> true
     */
    public AnalogDigitalConverterStream(OutputStream out,int threshold) {
        super(out);
        THRESHOLD=threshold;
    }

    @Override
    public void write(int b) throws IOException {
        out.write((b >= THRESHOLD ? Integer.MAX_VALUE : Integer.MIN_VALUE));
    }

    
}
