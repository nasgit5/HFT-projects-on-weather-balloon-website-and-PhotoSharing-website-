/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package decoders;

import decoders.common.AbstractDataPackage;
import decoders.common.AbstractDecoder;
import decoders.common.DataPackage;
import decoders.common.DecodingException;
import java.util.LinkedList;
import java.util.Queue;

/**
 * This class is just a "dummy" decoder to be able to submit datasets manually
 * via the gui
 *
 * @author Michael Kolb <dev(at)db1smk(dot)com>
 */
public class ManualInputDecoder extends AbstractDecoder {

    private final Queue<DataPackage> BUFFER = new LinkedList<>();

    public ManualInputDecoder() {
        super(1000);
    }

    @Override
    protected DataPackage decode(byte[] data) throws DecodingException {
        synchronized (BUFFER) {
            return BUFFER.poll();
        }

    }

    @Override
    protected byte[] fetchData() throws DecodingException {
        return null;
    }

    @Override
    public String identifier() {
        return "MANUAL";
    }

    /**
     * Quenues manually entered data for submission
     *
     * @param lat
     * @param lon
     * @param VCC
     * @param otemp
     * @param itemp
     * @param pressure
     * @param humidity
     */
    public void submit(final float lat, final float lon, final float VCC, final float otemp, final float itemp, final float pressure, final int humidity,final float altitude, final float accurancy) {
        final DataPackage PACKAGE = new AbstractDataPackage() {

            @Override
            public int getSequenceNo() {
                return -1;
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

            @Override
            public Float getBatteryVoltage() {
                return VCC;
            }


            @Override
            public Float getPrecision() {
                return accurancy;
            }

            @Override
            public Float getAltitude() {
                return altitude;
            }

          
        };
        synchronized (BUFFER) {
            BUFFER.add(PACKAGE);
        }
    }

}
