/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

package decoders.Filters;

/**
 * This class removes all frequencies outside the given filter range
 * @author Michael Kolb
 */
public class FrequencyFilter {
    private int lowerBound=-2;
    private int upperBound=-1;
    
 
    
    /**
     * Apply the filter on the given data
     * @param data
     * @return 
     */
    public float[] apply(float[] data){
        float[] result=data.clone();
        for (int i = 0; i < result.length; i++) {
            if(i <= lowerBound || i >= upperBound){
                result[i]=0;
            }
        }
        return result;
    }
/**
     * Sets the  filter bounds.
     * @param filterStart Minimum value is lowerBound + 1
     * @param filterEnd Minimum value is upperBound - 1
     */
    public void setBounds(int filterStart, int filterEnd) {
        if(filterStart >= filterEnd){
            throw new IllegalArgumentException("Lower bound is not lower than upper one or vice versa. Lower: "+filterStart+" Upper: "+filterEnd);
        }
        
        lowerBound=filterStart;
        upperBound=filterEnd;
    }
}
