/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

package Consumers;

import decoders.common.DataPackage;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.io.UnsupportedEncodingException;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * This class sends received payload to the central server.
 * It is able to buffer data for a certain time, just in case the connection gets lost.
 * @author Michael Kolb
 */
public class ServerConnector extends AbstractBufferedConsumer {
     
    private final URL SERVER_URL;
    public ServerConnector(String serverURL) {
        try {
            SERVER_URL=new URL(serverURL);
        } catch (MalformedURLException ex) {
            Logger.getLogger(ServerConnector.class.getName()).log(Level.SEVERE, null, ex);
            throw new RuntimeException(ex.toString());
        }
    }
    
    protected String encode2JSON(DataPackage data,String source){
        
        StringBuilder sb=new StringBuilder();
        sb.append("{");
        sb.append("\"daterec\":");
        sb.append(data.getDateRec().getTime());
        
        sb.append(",\"voltage\":");
        sb.append(data.getBatteryVoltage());
        
        sb.append(",\"humidity\":");
        sb.append(data.getHumidity());
        
        sb.append(",\"itemp\":");
        sb.append(data.getInsideTemp());
        
        sb.append(",\"otemp\":");
        sb.append(data.getOutsideTemp());
        
        sb.append(",\"lat\":");
        sb.append(data.getLatitude());
        
        sb.append(",\"lon\":");
        sb.append(data.getLongitude());
        
        sb.append(",\"pres\":");
        sb.append(data.getPressure());
        
        sb.append(",\"seq\":");
        sb.append(data.getSequenceNo());
        
        sb.append(",\"src\":");
        sb.append("\"");
        sb.append(source);
        sb.append("\"");
        
        sb.append("}");
        
        return sb.toString();
        
        
    }
    protected String encode2GetRequest(DataPackage data,String source){
        StringBuilder sb=new StringBuilder();
            sb.append("source=");
            sb.append(source);
            
            sb.append("&seq=");
            sb.append(data.getSequenceNo());
            
            sb.append("&vcc=");
            sb.append(data.getBatteryVoltage());
            
            sb.append("&hum=");
            sb.append(data.getHumidity());
            
            sb.append("&itemp=");
            sb.append(data.getInsideTemp());
            
            sb.append("&otemp=");
            sb.append(data.getOutsideTemp());
            
            sb.append("&lat=");
            sb.append(data.getLatitude());
            
            sb.append("&lon=");
            sb.append(data.getLongitude());
             
            sb.append("&pres=");
            sb.append(data.getPressure());
            return sb.toString();
    }
    
    @Override
    protected boolean processBufferEntry(BufferEntry be) {
       
        
        try {
            String getParams=encode2JSON(be.DATA,be.SOURCE);

            
            transmit(getParams);
            
            
           return true;
        } catch (UnsupportedEncodingException ex1) {
            Logger.getLogger(ServerConnector.class.getName()).log(Level.SEVERE, null, ex1);
        } catch (IOException ex1) {
            //for some reason the server did not respond properly, so buffer this for sending later on 
            Logger.getLogger(ServerConnector.class.getName()).log(Level.SEVERE, null, ex1);   
        }
        
        return false;
    }
    
    
    private void transmit(String body) throws IOException{
        HttpURLConnection connection = (HttpURLConnection) SERVER_URL.openConnection();
        try {
            connection.setRequestMethod("POST");
            connection.setDoInput(true);
            connection.setDoOutput(true);
            connection.setUseCaches(false);
            connection.setRequestProperty("Content-Type", "application/x-www-form-urlencoded");
            connection.setRequestProperty("Content-Length", String.valueOf(body.length()));
            try (OutputStreamWriter writer = new OutputStreamWriter(connection.getOutputStream())) {
                writer.write(body);
                writer.flush();
                writer.close();
                System.out.println("SENT TO SERVER");
            }
            //TODO response will be "true" as string if submission was successfull
            
            /*
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(connection.getInputStream()))) {
                
                while(reader.ready()) {
                    String response=reader.readLine();
                    //TODO response will be "true" as string if submission was successfull
                }
                
            }*/
            
        } finally {
            connection.disconnect();
        }
        
    }

    
}
