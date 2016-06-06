/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

package decoders.common;

import java.util.Date;
import org.junit.After;
import org.junit.AfterClass;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;
import static org.junit.Assert.*;

/**
 *
 * @author Michael Kolb <dev(at)db1smk(dot)com>
 */
public class AbstractDataPackageTest {
    
    public AbstractDataPackageTest() {
    }
    
    @BeforeClass
    public static void setUpClass() {
    }
    
    @AfterClass
    public static void tearDownClass() {
    }
    
    @Before
    public void setUp() {
    }
    
    @After
    public void tearDown() {
    }

    /**
     * Test of decode method, of class AbstractDataPackage.
     */
    @Test
    public void testDecode() {
        System.out.println("decode");
        String s = "HFTB1 2 P49.12346 P9.09986 P84.0 P89.0 P5.2 -25.3 P23.8 P1023.00 P37 +";
        
        DataPackage result = AbstractDataPackage.decode(s);
        
        /*
        * <PREFIX / CALL, arbitrary length> <SEQUENCE_NUMBER, Integer> <LAT, float>
     * <LON, float> <ALT, float> <PRECISION, float> <VCC, float> <OTEMP, float>
     * <ITEMP, float> <PRES, float> <HUM, integer> AR*/
        assertEquals(result.getSequenceNo(), 2);
        assertEquals(result.getLatitude(), 49.12346f,0.00001);
        assertEquals(result.getLongitude(), 9.09986f,0.00001);
        assertEquals(result.getLongitude(), 9.09986f,0.00001);
        assertEquals(result.getAltitude(), 84.0f,0.00001);
        assertEquals(result.getPrecision(), 89.0f,0.00001);
        assertEquals(result.getBatteryVoltage(), 5.2f,0.00001);
        assertEquals(result.getOutsideTemp(), -25.3f,0.00001);
        assertEquals(result.getInsideTemp(), 23.8f,0.00001);
        assertEquals(result.getPressure(), 1023.00f,0.00001);
        assertTrue(result.getHumidity()==37);
        
        
        
    }

   
   
    
}
