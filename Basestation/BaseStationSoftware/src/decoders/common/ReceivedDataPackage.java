/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package decoders.common;

/**
 * This package is used by the AbstractDataPackage.decode function.
 *
 * @author Michael Kolb <dev(at)db1smk(dot)com>
 */
class ReceivedDataPackage extends AbstractDataPackage {

    Integer sequenceNo = null;
    Float lat = null;
    Float lon = null;
    Float vcc = null;
    Float otemp = null;
    Float itemp = null;
    Float pressure = null;
    Integer humidity = null;
    Float altitude = null;
    Float precision = null;

    
    @Override
    public int getSequenceNo() {
        return sequenceNo;
    }

    @Override
    public Float getLatitude() {
        return lat;
    }

    @Override
    public Float getLongitude() {
       return lon;
    }

    @Override
    public Float getBatteryVoltage() {
        return vcc;
    }

    @Override
    public Float getPressure() {
        return pressure;
    }

    @Override
    public Float getOutsideTemp() {
        return otemp;
    }

    @Override
    public Float getInsideTemp() {
        return itemp;
    }

    @Override
    public Integer getHumidity() {
        return humidity;
    }

    public void setSequenceNo(Integer sequenceNo) {
        this.sequenceNo = sequenceNo;
    }

    public void setLat(Float lat) {
        this.lat = lat;
    }

    public void setLon(Float lon) {
        this.lon = lon;
    }

    public void setVcc(Float vcc) {
        this.vcc = vcc;
    }

    public void setOtemp(Float otemp) {
        this.otemp = otemp;
    }

    public void setItemp(Float itemp) {
        this.itemp = itemp;
    }

    public void setPressure(Float pressure) {
        this.pressure = pressure;
    }

    public void setHumidity(Integer humidity) {
        this.humidity = humidity;
    }

    
    
    
    /**
     * Determine wether this package contains any data or not
     * @return 
     */
    public boolean containsData(){
       return sequenceNo != null || lat != null || lon != null || vcc != null || otemp != null || itemp != null || pressure != null || humidity != null;
    }

    @Override
    public Float getPrecision() {
        return precision;
    }

    @Override
    public Float getAltitude() {
        return altitude;
    }

    void setAlt(float altitude) {
        this.altitude=altitude;
    }

    void setPrecision(float value) {
        this.precision=value;
    }

    @Override
    public String toString() {
        return "ReceivedDataPackage{" + "sequenceNo=" + sequenceNo + ", lat=" + lat + ", lon=" + lon + ", vcc=" + vcc + ", otemp=" + otemp + ", itemp=" + itemp + ", pressure=" + pressure + ", humidity=" + humidity + ", altitude=" + altitude + ", precision=" + precision + '}';
    }
    
    
    
}
