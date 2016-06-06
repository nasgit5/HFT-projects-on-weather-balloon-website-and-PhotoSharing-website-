package smsinterface;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;

/**
 * Connection Class for simvalley Mobile - GPS GSM Tracker GT-170 v2 For
 * conncetion over the GSM Network the SMS Server Tools 3
 * (http://smstools3.kekekasvi.com) is recommended
 *
 * @author frankholzwarth
 */
public class SendSMSCommands {

    String outgoingDirectory;
    String trackerNumber;
    String trackerPinNumber;

    /**
     *
     * @param outgoingDirectory Sets the outgoing directory of the SMS server
     * @param trackerNumber Number of the GPS Device starts wit country code eg.
     * Germany 49173... (Sting for zero error handling)
     * @param trackerPinNumber Pin number of the GPS Device (Sting for zero
     * error handling)
     */
    public SendSMSCommands(String outgoingDirectory, String trackerNumber, String trackerPinNumber) {
        this.outgoingDirectory = outgoingDirectory;
        this.trackerNumber = trackerNumber;
        this.trackerPinNumber = trackerPinNumber;
    }

    /**
     * Send Command to receive a single GPS Position
     */
    public void singleGPSInfo() {
        createCommandSMSFile(createTransmisson(trackerNumber, createCommand("88", trackerPinNumber)));
    }

    /**
     * Send Command to receive a GPS position data by an minute interval
     *
     * @param interval Interval in minutes
     */
    public void intervalGPSInfo(int interval) {
        createCommandSMSFile(createTransmisson(trackerNumber, createCommand("11", trackerPinNumber, "" + interval)));
    }

    /**
     * Stops the intervall started by th method intervalGPSInfo
     */
    public void stopGPSinterval() {
        createCommandSMSFile(createTransmisson(trackerNumber, createCommand("011", trackerPinNumber)));
    }

    /**
     * Connect the tracker to a guardian phone
     *
     * @param number number of the guardian phone
     */
    public void buddyPhoneNumber(String number) {
        createCommandSMSFile(createTransmisson(trackerNumber, createCommand("188", trackerPinNumber, number)));
    }

    /**
     * Creates a file to send the SMS via the SMS Server
     *
     * @param transmissionString Number and Message to send
     */
    private void createCommandSMSFile(String transmissionString) {
        BufferedWriter writer = null;
        try {
            File logFile = new File(outgoingDirectory + "SendTransmission.txt");

            writer = new BufferedWriter(new FileWriter(logFile));
            writer.write(transmissionString);
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            try {
                writer.close();
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }

    /**
     * Create a sms transmission String
     *
     * @param number Traget number to send to
     * @param command The command for the GPS Tracker as the SMS text message
     * @return formated Message for the SMS Server
     */
    private String createTransmisson(String number, String command) {
        StringBuilder transmissionString = new StringBuilder("To: ");
        transmissionString.append(number);
        transmissionString.append(System.getProperty("line.separator"));
        transmissionString.append(System.getProperty("line.separator"));
        transmissionString.append(command);
        return transmissionString.toString();
    }

    /**
     * Creates a single transmision string with a single command and the device
     * password
     *
     * @param commandParts GPS Tracker command to build with seperation via #
     * @return created command string ready for transmission
     */
    private String createCommand(String... commandParts) {
        StringBuilder commandString = new StringBuilder("*#");
        for (String string : commandParts) {
            commandString.append(string);
            commandString.append('#');
        }
        return commandString.toString();
    }

}
