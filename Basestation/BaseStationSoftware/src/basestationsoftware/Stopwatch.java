/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

package basestationsoftware;

/**
 * Class for performance meassuring of code blocks
 * @author Michael Kolb 
 */
public class Stopwatch {
    private long startTime;
    private long stopTime;
    
    /**
     * Start the clock
     */
    public synchronized void start(){
        startTime=System.currentTimeMillis();
    }
    
    /**
     * Stop the clock
     */
    public synchronized void stop(){
        stopTime=System.currentTimeMillis();
    }

    @Override
    public String toString() {
        long duration=stopTime-startTime;
        return duration+" ms";
    }
    
    
}
