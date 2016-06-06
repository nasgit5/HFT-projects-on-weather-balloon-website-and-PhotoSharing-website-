/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

package Consumers;

import decoders.common.DataPackage;
import java.util.Date;
import org.junit.After;
import org.junit.AfterClass;
import org.junit.Before;
import org.junit.Test;
import static org.junit.Assert.*;
import org.junit.BeforeClass;

/**
 *
 * @author Michael Kolb <dev(at)db1smk(dot)com>
 */
public class ServerConnectorTest {
    
    public ServerConnectorTest() {
    }
    
    
    DataPackage DP = new DataPackage() {

        @Override
        public Date getDateRec() {
            return new Date();
        }

        @Override
        public int getSequenceNo() {
            return 1;
        }

        @Override
        public Float getLatitude() {
            return 49.123456f;
        }

        @Override
        public Float getLongitude() {
            return 9.123456f;
        }

        @Override
        public Float getBatteryVoltage() {
            return 4.2f;
        }

        @Override
        public Float getPressure() {
            return 1234.2f;
        }

        @Override
        public Float getOutsideTemp() {
            return -10.1f;
        }

        @Override
        public Float getInsideTemp() {
            return 19.2f;
        }

        @Override
        public Integer getHumidity() {
            return 99;
        }

       
        @Override
        public Float getPrecision() {
            return 89f;
        }

        @Override
        public Float getAltitude() {
            return 100f;
        }
            
            
};
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
     * Test of processBufferEntry method, of class ServerConnector.
     */
    @Test
    public void testformatJSON() {
        System.out.println("processBufferEntry");
        
        ServerConnector instance = new ServerConnector("http://localhost");
        
        String result = instance.encode2JSON(DP,"EXT");
        System.out.println(result);
        //assertEquals(expResult, result);
        // TODO review the generated test code and remove the default call to fail.
        //fail("The test case is a prototype.");
    }
    
}
