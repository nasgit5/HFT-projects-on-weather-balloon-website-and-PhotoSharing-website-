package GSMCommunication;

import java.awt.geom.Point2D;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.UnsupportedEncodingException;
import java.nio.file.FileSystems;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardWatchEventKinds;
import java.nio.file.WatchEvent;
import java.nio.file.WatchKey;
import java.nio.file.WatchService;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.xml.parsers.ParserConfigurationException;
import org.xml.sax.SAXException;

/**
 * Observes a Folder for incoming SMS and creates GPS data from them
 *
 * @author frankholzwarth
 */
public class CheckNewIncome implements Runnable {

    private WatchService watchService = null;
    private String deviceName;
    private String directory;
    
    private Point2D.Double actualPoint = new Point2D.Double(0.0, 0.0);
    public CheckNewIncome(String directory, String deviceName) {
        this.deviceName = deviceName;
        this.directory = directory;
        try {
            Path watchFolder = Paths.get(directory);
            watchService = FileSystems.getDefault().newWatchService();
            watchFolder.register(watchService, StandardWatchEventKinds.ENTRY_CREATE);
        } catch (IOException ex) {
            Logger.getLogger(CheckNewIncome.class.getName()).log(Level.SEVERE, null, ex);
        }

    }

    /**
     * Execution for a single file in the directory
     *
     * @param fileName Name to execute
     */
    public void justExe(String fileName) {
        System.out.println(readSMSData(directory + fileName).toString());
    }

    /**
     * Checks for new Messages in the incoming folder of the SMS Server as a
     * Thread
     */
    @Override
    public void run() {
        boolean valid = false;

        do {

            WatchKey watchKey = null;
            try {
                watchKey = watchService.take();
            } catch (InterruptedException ex) {
                Logger.getLogger(CheckNewIncome.class.getName()).log(Level.SEVERE, null, ex);
            }

            for (WatchEvent<?> event : watchKey.pollEvents()) {
                if (StandardWatchEventKinds.ENTRY_CREATE.equals(event.kind())) {
                    String fileName = event.context().toString();

                    if (fileName.matches(deviceName + "\\..*")) {
                        
                        actualPoint = readSMSData(directory + fileName);
                        System.out.println(actualPoint.toString());
                    } else {
                        System.err.println("File sms name incorrect: " + fileName);
                    }
                }
            }
            valid = watchKey.reset();

        } while (valid);
    }

    /**
     * Reads the Data from the incoming SMS in connection to directory
     *
     * @param fileName Name of the file to read From
     * @return Point of double for the GPS Position with a accuracy of 6
     * (latitude,latitude)
     */
    private Point2D.Double readSMSData(String fileName) {
        String lbsLine = null;
        String latLine = null;
        String longLine = null;
        GeolocationCalculation calculator = new GeolocationCalculation();

        try {
            File fileDir = new File(fileName);

            BufferedReader in = new BufferedReader(
                    new InputStreamReader(
                            new FileInputStream(fileDir), "ISO-8859-2"));

            String line;
            while ((line = in.readLine()) != null) {
                String str = removeUTF8BOM(line);
                if (str.matches("LBS:.*")) {
                    lbsLine = str;
                }
                if (str.matches("Lat:.*")) {
                    latLine = str;
                }

                if (str.matches("Lon:.*")) {
                    longLine = str;
                }

            }
            in.close();
        } catch (UnsupportedEncodingException e) {
            System.out.println(e.getMessage());
        } catch (IOException e) {
            System.out.println(e.getMessage());
        }
        // Check for the correct information in the SMS data
        if (lbsLine == null && latLine == null && longLine == null) {
            System.err.println("Wrong SMS Format for Loacalisation");
            return new Point2D.Double(0.0, 0.0);
        }

        if (lbsLine != null) {
            try {
                return calculator.createCoordintesFromLBS(lbsLine.split(":")[1]);
            } catch (IOException ex) {
                Logger.getLogger(CheckNewIncome.class.getName()).log(Level.SEVERE, null, ex);
            } catch (ParserConfigurationException ex) {
                Logger.getLogger(CheckNewIncome.class.getName()).log(Level.SEVERE, null, ex);
            } catch (SAXException ex) {
                Logger.getLogger(CheckNewIncome.class.getName()).log(Level.SEVERE, null, ex);
            }
        }
        if (latLine != null && longLine != null) {
            return calculator.convertGPS(latLine.split(":")[1], longLine.split(":")[1]);
        }
        return new Point2D.Double(0.0, 0.0);

    }

    /**
     * Removes the empty chars from an UCS-2/UTF-8 combined Format
     *
     * @param s String to fix
     * @return a /0 cleared String
     */
    public static String removeUTF8BOM(String s) {
        final StringBuilder sb = new StringBuilder();
        for (char character : s.toCharArray()) {
            if (character != '\0') {
                sb.append(character);
            }
        }
        return sb.toString();

    }
    
    /**
     * Get the actual Point from the SMS spool
     * @return The actual Point
     */
    public Point2D.Double getActualPoint() {
        return actualPoint;
    }

}
