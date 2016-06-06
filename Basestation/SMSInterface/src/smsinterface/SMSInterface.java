/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package smsinterface;

import java.io.BufferedReader;
import java.io.IOException;
/**
 *
 * @author frankholzwarth
 */
import java.io.InputStreamReader;
import java.util.logging.Level;
import java.util.logging.Logger;

public class SMSInterface {

    /**
     * @param args the command line arguments
     */
    public static void main(String[] args) {

        
        CheckNewIncome incomeObserver = new CheckNewIncome("/Users/Shared/smsSpool/incoming/","GSM1");
        Thread observerThread = new Thread(incomeObserver);
        SendSMSCommands sendCommand = new SendSMSCommands("/Users/Shared/smsSpool/outgoing/","491757632243","0000");
        observerThread.start();
        //incomeObserver.justExe("GSM1.a63eTz");
            
        while (true) {
            BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
            
            String inputCommand = null;

            try {
                inputCommand = br.readLine();
                
                if(inputCommand.equals("single")){
                    System.out.println("single message");
                    sendCommand.singleGPSInfo();
                }
                
                if(inputCommand.equals("multiple")){
                    System.out.println("multiple message");
                    sendCommand.intervalGPSInfo(1);
                }
                
                if(inputCommand.equals("stop multiple")){
                    System.out.println("stop multiple message");
                    sendCommand.stopGPSinterval();
                }
                
                if(inputCommand.equals("buddy")){
                    System.out.println("set buddy");
                    sendCommand.buddyPhoneNumber("+491757679475");
                }

                
            } catch (IOException e) {
                e.printStackTrace();
                System.exit(1);
            }
            
        }
    }
}
