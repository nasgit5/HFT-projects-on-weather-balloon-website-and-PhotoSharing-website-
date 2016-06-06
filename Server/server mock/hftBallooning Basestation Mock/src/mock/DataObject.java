package mock;

import java.sql.Timestamp;
import java.util.Date;

public class DataObject {

	private double lon;
	private double lat;
	private float humidity;
	private String daterec;
	private float otemp;
	private float itemp;
	private float voltage;
	private float pres;
	private float precision;
	
	private boolean firstSet = true;
	
	private float altitude;
	private long dateMilliseconds;
	
	private double ChangeRate = 00.00001;
	private double latChangeRate = 00.00004;
	
	public DataObject(double lon, double lat, float humidity,
			float otemp, float itemp, float voltage, float pres, float altitude) {
		this.lon = lon;
		this.lat = lat;
		this.humidity = humidity;
		this.daterec =  new Timestamp(new Date().getTime()).toString();
//		this.daterec = new Timestamp(new Date());
		this.otemp = otemp;
		this.itemp = itemp;
		this.voltage = voltage;
		this.pres = pres;
		this.altitude = altitude;
		this.dateMilliseconds = (new Date()).getTime();
		this.precision = 4.4f;
	}
	
	public DataObject getNextObject() {
		//this.lon += (Math.random() *  00.0001 - 00.00002);
		//this.lat += (Math.random() *  00.0001 - 00.00002);
		this.lon += (Math.random() *  00.001 - 00.00002);
		this.lat += (Math.random() *  00.001 - 00.00002);
		this.humidity = this.humidity + (float) (Math.random() - 0.5);
		this.daterec =  new Timestamp(new Date().getTime()).toString();
		this.otemp = this.otemp + (float) (Math.random() - 0.5);
		this.itemp = this.itemp + (float) (Math.random() - 0.5);
		this.voltage -= (float) (Math.random()*0.1);
		this.pres -= (float) (Math.random())*1.5;
		if(!firstSet)
		{
			this.altitude += (float) (Math.random() * 15);
		}
		else
		{
			firstSet = false;
		}
		this.dateMilliseconds = (new Date()).getTime();
		this.precision = 4.4f;
		return this;
	}
	
	@Override
	public String toString(){
		String result = "{ \"daterec\" : \""+ this.daterec.toString().replace("-", "").replace(":", "").replace(".", "").trim() + "\", \"voltage\" : \"" + this.voltage + "\", \"humidity\" : \"" + this.humidity + "\", \"itemp\" : \"" + this.itemp + "\", \"otemp\" : \"" + this.otemp + "\", \"lat\" : \"" + this.lat + "\", \"lon\" : \"" + this.lon + "\", \"pres\" : \"" + this.pres + "\", \"precision\" : \"" + this.precision + "\", \"altitude\" : \"" + this.altitude + "\" }";
		return result;
	}
	

}
