/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

package sendmorsecode;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 *
 * @author frankholzwarth
 */
public class SendMorseCode {

    /**
     * @param args the command line arguments
     */
        public static void main(String[] args) {
        BufferedReader br = null;
 
		try {
 
			String sCurrentLine;
 
			br = new BufferedReader(new FileReader("../../Test/Arduino_test_data/5_min_Flight_Beaufort_scale_4_backup_data_difference_1_percent.csv"));
 
			while ((sCurrentLine = br.readLine()) != null) {
				System.out.println(sCurrentLine);
                                String[] splited = sCurrentLine.split(";");
                                //System.out.println(splited.length);
                                Float longitude = new Float(splited[0]);
                                Float latidude = new Float(splited[1]);
                                Float tempInside = new Float(splited[2]);
                                Float tempInsideBackup = new Float(splited[3]);
                                Float tempOutside = new Float(splited[4]);
                                Float tempOutsideBackup = new Float(splited[5]);
                                Float humidity = new Float(splited[6]);
                                Float humidityBackup = new Float(splited[7]);
                                Float pressure = new Float(splited[8]);
                                Float pressureBackup = new Float(splited[9]);
                                int runtime = new Integer(splited[10]);
                            try {
                                Thread.sleep(1000);
                            } catch (InterruptedException ex) {
                                Logger.getLogger(SendMorseCode.class.getName()).log(Level.SEVERE, null, ex);
                            }
			}
 
		} catch (IOException e) {
			e.printStackTrace();
		} finally {
			try {
				if (br != null)br.close();
			} catch (IOException ex) {
				ex.printStackTrace();
			}
		}
    }
    
}
