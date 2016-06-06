/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

package decoders.common;

import java.util.Date;

/**
 * Interface that represents one data package 
 * @author Michael Kolb 
 */
public interface DataPackage {
    
    
    /**
     * Date this package was received
     * @return  
     */
    public Date getDateRec();
    /**
     * Unique sequence number for this packet
     * @return 
     */
    public int getSequenceNo();
    /**
     * Get latitude value.
     * This value may also be null if not applicable for some reason.
     * @return 
     */
    public Float getLatitude();
    /**
     * Get longitude value.
     * This value may also be null if not applicable for some reason.
     * @return 
     */
    public Float getLongitude();
    
    /**
     * Get battery voltage of battery in volts.
     * This value may also be null if not applicable for some reason.
     * @return 
     */
    public Float getBatteryVoltage();
   
    /**
     * Get pressure value in hPa
     * This value may also be null if not applicable for some reason.
     * @return 
     */
    public Float getPressure();
    
    /**
     * Get outside temperature in °C.
     * This value may also be null if not applicable for some reason.
     * @return 
     */
    public Float getOutsideTemp();
    /**
     * Get inside temperature in °C.
     * This value may also be null if not applicable for some reason.
     * @return 
     */
    public Float getInsideTemp();
    /**
     * Get humidity value.
     * This value may also be null if not applicable for some reason.
     * @return 
     */
    public Integer getHumidity();
    
    
    /**
     * Position precision in percent
     * @return 
     */
    public Float getPrecision();
    
    
    /**
     * Altitude in 10th of meters
     * @return 
     */
    public Float getAltitude();
 
    /**
     * Returns a human readable repesentation of this package
     * @return 
     */
    public String toString();
}
