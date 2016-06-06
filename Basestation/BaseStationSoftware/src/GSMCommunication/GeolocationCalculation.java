/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package GSMCommunication;

import java.awt.geom.Point2D;
import java.io.IOException;
import java.net.URL;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import org.w3c.dom.Document;
import org.xml.sax.SAXException;

/**
 *
 * @author frankholzwarth
 */
public class GeolocationCalculation {

    /**
     * For calculation of the Local Based Service string of the GSM GPS Tracker
     * to a GPS Coordinate Stands for Mobile Country Code 262 -> Germany
     */
    private final int GSM_MCC = 262;

    /**
     * For calculation of the Local Based Service string of the GSM GPS Tracker
     * to a GPS Coordinate Stands for Mobile Network Code 1 -> T-Mobile and
     * Congstar
     */
    private final int GSM_MNC = 1;

    /**
     * Greates GPS coordinates from GSM Data with a call to open Cellid Api
     *
     * @param lbs The lbs String from the simvalley GPS GSM Tracker
     * @return A Point of GPS coordinates, if response is wrong point is
     * (0.0/0.0)
     * @throws IOException
     * @throws ParserConfigurationException
     * @throws SAXException
     */
    public Point2D.Double createCoordintesFromLBS(String lbs) throws IOException, ParserConfigurationException, SAXException {
        int lac = Integer.parseInt(lbs.substring(0, 4), 16);
        int cellID = Integer.parseInt(lbs.substring(4, 8), 16);
        DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();
        DocumentBuilder db = dbf.newDocumentBuilder();
        String urlTemplate = "http://www.opencellid.org/cell/get?mcc=%d&mnc=%d&cellid=%d&lac=%d";
        String urlFormatted = String.format(urlTemplate, GSM_MCC, GSM_MNC, cellID, lac);
        Document doc = db.parse(new URL(urlFormatted).openStream());
        // If a Location is found
        if (doc.getFirstChild().getAttributes().getNamedItem("stat").getNodeValue().equals("ok")) {
            double lat = new Double(doc.getElementsByTagName("cell").item(0).getAttributes().getNamedItem("lat").getNodeValue());
            double lon = new Double(doc.getElementsByTagName("cell").item(0).getAttributes().getNamedItem("lon").getNodeValue());
            return new Point2D.Double(roundDouble(lat), roundDouble(lon));
        }

        return new Point2D.Double(0.0, 0.0);
    }

    /**
     * Converter for GPS information in the format degree,minutes,seconds to an
     * degree only format
     *
     * @param lat input latitude value eg. N52°31'14.94"
     * @param lon input latitude value eg. E13°24'34.02"
     * @return Point of double for the GPS Position with a accuracy of 6
     * (latitude,latitude)
     */
    public Point2D.Double convertGPS(String lat, String lon) {
        double latitude = convertToDegree(lat);
        double longitude = convertToDegree(lon);
        return new Point2D.Double(latitude, longitude);
    }

    /**
     * Converter of a single value of degree,minutes,second to degree only
     *
     * @param degreeMinSec input GPS value eg. N52°31'14.94"/E13°24'34.02"
     * @return Double with a accuracy of 6
     */
    private double convertToDegree(String degreeMinSec) {
        Pattern p = Pattern.compile("[A-Za-z]([0-9]{1,2})°([0-9]{1,2})'([0-9]{1,2}\\.[0-9]{1,2})\"");
        Matcher m = p.matcher(degreeMinSec);

        if (m.find()) {
            double degree = new Double(m.group(1));
            double minutes = new Double(m.group(2));
            double seconds = new Double(m.group(3));
            double calculated = degree + (minutes + (seconds) / 60) / 60;
            return roundDouble(calculated);
        } else {
            return 0.0;
        }
    }
    
    private double roundDouble(double input){
        return (double) Math.round(input * 1000000) / 1000000;
    }

}
