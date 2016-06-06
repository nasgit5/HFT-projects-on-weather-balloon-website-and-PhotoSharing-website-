/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

package decoders.Filters;

/**
 *
 * @author Michael Kolb <dev(at)db1smk(dot)com>
 */
public class SquelchFilter {

    float peakValue=Float.MIN_VALUE;
    int squelchValue=0;
    
    private float getSquelchBorderValue(){
        return (peakValue/8000.0f)*squelchValue;   
    }
    
    public float[] apply(float[] data){
        float squelchBorder=getSquelchBorderValue();
        
        for (int i = 0; i < data.length; i++) {
            peakValue=Math.max(peakValue, data[i]);
            if(data[i] < squelchBorder){
                data[i] = 0;
            }
            
        }
        return data;
    }
    
    /**
     * Set squelch value
     * @param val Value between 0 and 100
     */
    public void setSquelch(int val){
        squelchValue=val;
    }
}
