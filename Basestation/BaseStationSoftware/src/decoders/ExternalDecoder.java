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
import java.io.BufferedReader;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Uses Signals that were decoded by an external decoder.
 * To do this, this class uses a fifo file buffer at /tmp/cocaModem.fifo
 * @author Michael Kolb <dev(at)db1smk(dot)com>
 */
public class ExternalDecoder extends AbstractDecoder{

    private static final String FIFO_FILE="/tmp/cocaModem.fifo"; 
    BufferedReader reader=null;
    
    
    StringBuilder sb = new StringBuilder();

    public ExternalDecoder() {
        super(5);
    }
    
    
    private void resetFifo(){
        
    }
    
    @Override
    protected DataPackage decode(byte[] data) throws DecodingException {
        DataPackage dpackage=null;
        if(reader != null){
            try {
                char c=(char)reader.read();
                
                //check for invalid values
                if(c != -1 && c != 65535){
                    sb.append(c);
                    fireCharDecoded(c+"");
                    dpackage=AbstractDataPackage.decode(sb.toString().trim());
                }
            } catch (IOException ex) {
                Logger.getLogger(ExternalDecoder.class.getName()).log(Level.SEVERE, null, ex);
            }
        }
        
        //If there was a match, flush the buffer
        if(dpackage != null){
            sb=new StringBuilder();
        }
        
        return dpackage;
    }

    @Override
    protected byte[] fetchData() throws DecodingException {
        return null;
    }

    @Override
    public String identifier() {
        return "EXT";
    }

    @Override
    public synchronized void listen() {
        try {
            reader=new BufferedReader(new FileReader(FIFO_FILE));
        } catch (FileNotFoundException ex) {
            Logger.getLogger(ExternalDecoder.class.getName()).log(Level.SEVERE, null, ex);
            System.err.println("Error opening fifo. External Decoder disabled.");
        }
        super.listen(); //To change body of generated methods, choose Tools | Templates.
    
    }
    
    
    
}
