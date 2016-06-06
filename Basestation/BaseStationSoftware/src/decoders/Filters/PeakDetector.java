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
 * This filter detects a peak in an array of numbers by averaging the values within the given width.
 * @author Michael Kolb 
 */
public class PeakDetector {

    private final int WIDTH;
    /**
     * Constructor
     * @param width The filter bandwidth. E.g. a value of 5 would result in a filter which is 5 array entries wide. This has to be an odd number.
     */
    public PeakDetector(int width){
        
        if(width % 2 == 0 ){
            throw new IllegalArgumentException("Width has to be odd");
        }
        WIDTH=width;
        
    }

    
    /**
     * Applies the filter onto the given array.
     * @param values
     * @return Array indices of the highest peak in the given data. (Marks the middle of the peak)
     */
    public int detect(float[] values){
        int peakIndex=-1;
        float peakAverage=Float.MIN_VALUE;
        for (int i = 0; i < values.length; i++) {
            
            //Scrub over a part of the given array and calc the average peak value within the width
            float sum=0;
            for (int j = 0; j < WIDTH && j+i < values.length; j++) {
                sum+=values[i+j];
            }
            float average=sum/WIDTH;
            
            //Check if the new peak is higher than the old one
            if(average > peakAverage){
                peakAverage=average;
                peakIndex=i+ (int)Math.ceil(WIDTH/2.0); 
                
            }
            
        }
        peakIndex=Math.min(peakIndex,values.length);
        return peakIndex;
    }
    
}
