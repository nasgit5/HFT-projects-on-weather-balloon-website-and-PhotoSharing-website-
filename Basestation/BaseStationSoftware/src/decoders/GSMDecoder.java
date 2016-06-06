/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package decoders;

import GSMCommunication.CheckNewIncome;
import GSMCommunication.SendSMSCommands;
import decoders.common.AbstractDecoder;
import decoders.common.DataPackage;
import decoders.common.DecodingException;
import java.io.BufferedReader;
import java.io.File;
import java.io.InputStreamReader;
import java.util.Date;

/**
 * Decoder for SMS messages
 *
 * @author Michael Kolb
 */
public class GSMDecoder extends AbstractDecoder {

    /**
     * Spool diectory from the SMS Server instalation
     */
    private final String SPOOL = "/Users/Shared/smsSpool/incoming/";

    /**
     * SMS Device named at the SMS Server
     */
    private final String DEVICE_NAME= "GSM1";
    
    
    private CheckNewIncome incomeObserver = null;
    private Thread observerThread = null;
    private boolean smsServerReady = false;
    public GSMDecoder() {
        super(1500);
        startObservation();
    }
    /**
     * Checks if the Envirment(structure and processes) is ready
     * If is ready then starts the message communication
     */
    private void startObservation(){
        smsServerReady = checkEnviroment();
        if (smsServerReady) {
            incomeObserver = new CheckNewIncome(SPOOL, DEVICE_NAME);
            observerThread = new Thread(incomeObserver);
            observerThread.start();
        }
    }
    
    /**
     * Try again to start the observation
     */
    public void restartCommunication(){
        if(!smsServerReady){
            startObservation();
        }
    }

    @Override
    protected DataPackage decode(byte[] data) throws DecodingException {

        if (!smsServerReady || (incomeObserver.getActualPoint().getX() == 0.0 && incomeObserver.getActualPoint().getY() == 0.0)) {
            return null;
        }
        return new DataPackage() {

            @Override
            public Date getDateRec() {
                return new Date();
            }

            @Override
            public int getSequenceNo() {
                return 0;
            }

            @Override
            public Float getLatitude() {
                return new Float(incomeObserver.getActualPoint().getX());
            }

            @Override
            public Float getLongitude() {
                return new Float(incomeObserver.getActualPoint().getY());
            }

            @Override
            public Float getBatteryVoltage() {
                return 0.0f;
            }

            @Override
            public Float getPressure() {
                return 0.0f;
            }

            @Override
            public Float getOutsideTemp() {
                return 0.0f;
            }

            @Override
            public Float getInsideTemp() {
                return 0.0f;
            }

            @Override
            public Integer getHumidity() {
                return 0;
            }

            @Override
            public Float getPrecision() {
                return 0.0f;
            }

            @Override
            public Float getAltitude() {
                return 0.0f;
            }
        };
    }

    @Override
    protected byte[] fetchData() throws DecodingException {
        return null;
    }

    @Override
    public String identifier() {
        return "GSM";
    }

    /**
     * Checks if process is running and directory exists
     *
     * @return True if the Envirorement is running
     */
    private boolean checkEnviroment() {
        boolean processRunning = false;
        String command = "pgrep smsd";
        try {
            Process p = Runtime.getRuntime().exec(command);
            BufferedReader input = new BufferedReader(new InputStreamReader(p.getInputStream()));
            while ((input.readLine()) != null) {
                processRunning = true;
            }
            input.close();
        } catch (Exception err) {
            err.printStackTrace();
        }

        if (!processRunning) {
            System.err.println("smsd is not running");
        }

        File directory = new File(SPOOL);
        if (!directory.exists()) {
            System.err.println(SPOOL + " does not exists");
        }

        if (!directory.isDirectory()) {
            System.err.println(SPOOL + " is not a directory");
        }

        return processRunning && directory.exists() && directory.isDirectory();
    }

    public boolean isReadyToCommunicate() {
        return smsServerReady;
    }

    
}
