/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

package decoders.common;

/**
 * Exception which will be thrown on decoding errors
 * @author Michael Kolb 
 */
public class DecodingException extends Exception{

    public DecodingException(String message) {
        super(message);
    }
    
    
}
