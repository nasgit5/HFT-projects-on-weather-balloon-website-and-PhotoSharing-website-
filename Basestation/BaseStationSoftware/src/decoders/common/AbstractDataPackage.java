/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package decoders.common;

import java.util.Date;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 *
 * @author Michael Kolb <dev(at)db1smk(dot)com>
 */
public abstract class AbstractDataPackage implements DataPackage {

    protected final Date DATE;

    /**
     * String format for RF input (Morse, PSK31, etc.)
     */
    private static final Pattern stringFormatRF = Pattern.compile(".*([0-9])\\s*([P-]\\d+\\.\\d+)\\s*([P-]\\d+\\.\\d+)\\s*([P-]\\d+\\.\\d+)\\s*([P-]\\d+.\\d+)\\s*([P-]\\d+.\\d+)\\s*([P-]\\d+.\\d+)\\s*([P-]\\d+.\\d+)\\s*([P-]\\d+.\\d+)\\s*([P-]\\d+)\\s*.*", Pattern.CASE_INSENSITIVE);
    /**
     * String format for SMS sent by the GPS Tracker
     */
    private static Pattern stringFormatTracker = Pattern.compile("", Pattern.CASE_INSENSITIVE);
    /**
     * String format for SMS sent by the GSM Arduino Shield
     */
    private static Pattern stringFormatGSMModule = Pattern.compile("", Pattern.CASE_INSENSITIVE);

    /**
     * Tries to decode the given string. The matching is done against the end of
     * the string, so any additional prefix data may be ignored. String format
     * may be one of the following formats:
     *
     * HFTB1 2 P49.12346 P9.09986 P84.0 P89.0 P5.2 -25.3 P23.8 P1023.00 P37 +
     * <PREFIX / CALL, arbitrary length> <SEQUENCE_NUMBER, Integer> <LAT, float>
     * <LON, float> <ALT, float> <PRECISION, float> <VCC, float> <OTEMP, float>
     * <ITEMP, float> <PRES, float> <HUM, integer> AR
     *
     * @param s
     * @return
     */
    public static DataPackage decode(String s) {

        ReceivedDataPackage result = null;

        Matcher matcherRF = stringFormatRF.matcher(s);
        Matcher matcherTracker = stringFormatTracker.matcher(s);
        Matcher matcherGSMModule = stringFormatGSMModule.matcher(s);
        if (matcherRF.matches()) {
            /*
             Matchgroups are (based on the example on top of this class)
             1.	4
             2.	+49.12346
             3.	+9.09986
             4.	+68.0
             5.	+89
             6.	+5.2
             7.	-25.3
             8.	+26.0
             9.	+1003.81
             10. +33
             */
            result = new ReceivedDataPackage();
            result.setSequenceNo(Integer.parseInt(matcherRF.group(1).replace('P', '+')));
            result.setLat(Float.parseFloat(matcherRF.group(2).replace('P', '+')));
            result.setLon(Float.parseFloat(matcherRF.group(3).replace('P', '+')));
            result.setAlt(Float.parseFloat(matcherRF.group(4).replace('P', '+')));
            result.setPrecision(Float.parseFloat(matcherRF.group(5).replace('P', '+')));
            result.setVcc(Float.parseFloat(matcherRF.group(6).replace('P', '+')));
            result.setOtemp(Float.parseFloat(matcherRF.group(7).replace('P', '+')));
            result.setItemp(Float.parseFloat(matcherRF.group(8).replace('P', '+')));
            result.setPressure(Float.parseFloat(matcherRF.group(9).replace('P', '+')));
            result.setHumidity(Integer.parseInt(matcherRF.group(10).replace('P', '+')));

        } else if (matcherTracker.matches()) {
            //TODO implement

        } else if (matcherGSMModule.matches()) {
            //TODO implement

        }

        return (result != null && result.containsData()) ? result : null;

    }

    public AbstractDataPackage() {
        DATE = new Date();
    }

    @Override
    public Date getDateRec() {
        return DATE;
    }
;

    


    
    
}
