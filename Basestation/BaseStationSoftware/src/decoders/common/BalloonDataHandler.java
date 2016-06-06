package decoders.common;

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Interface which you may implement if you are interested in receiving balloon data.
 * @author Michael Kolb
 */
public interface BalloonDataHandler {
    
    /**
     * This function will be called if there are any errors within the decoding process.
     * MAKE SURE THIS METHOD PROCESSES DATA ASYNCHRONIOUSLY, AS THE DECODER WILL HANG UNTIL THIS METHOD RETURNED
     * This may be something like a checksum mismatch or simply invalid data.
     * @param decoder The decoder instance which sent this event. This is for determining by which decoder the package has been received.
     * @param ex An exception object which describes the error.
     */
    public void onDecodingError(final BalloonDataDecoder decoder, final DecodingException ex);
    
    /**
     * This will be called as soon as a data package was decoded.
     * MAKE SURE THIS METHOD PROCESSES DATA ASYNCHRONIOUSLY, AS THE DECODER WILL HANG UNTIL THIS METHOD RETURNED
     * @param data Contains the payload which was received.
     * @param decoder The decoder instance which sent this event. This is for determining by which decoder the package has been received.
     */    
    public void onData(final BalloonDataDecoder decoder,final DataPackage data);
    
    
    /**
     * Called immediately after data has been received. Data is may be trashy and may be thrown away later on.
     * MAKE SURE THIS METHOD PROCESSES DATA ASYNCHRONIOUSLY, AS THE DECODER WILL HANG UNTIL THIS METHOD RETURNED
     * @param decoder
     * @param rawData 
     */
    public void onRAWData(BalloonDataDecoder decoder,  byte[] rawData);
    
    
    /**
     * Called immediately after data has been converted to a audio spectrum. Data is may be trashy and may be thrown away later on.
     * MAKE SURE THIS METHOD PROCESSES DATA ASYNCHRONIOUSLY, AS THE DECODER WILL HANG UNTIL THIS METHOD RETURNED
     * @param decoder
     * @param spectrum
     */
    public void onSpectrumData(BalloonDataDecoder decoder,float[] spectrum);

    /**
     * Called immediately after detection of a dot, dash or pause signal. 
     * MAKE SURE THIS METHOD PROCESSES DATA ASYNCHRONIOUSLY, AS THE DECODER WILL HANG UNTIL THIS METHOD RETURNED
     * @param c a dash, dot or space
     */
    public void onDotDashDecoded(BalloonDataDecoder decoder,String c);
    
    
    /**
     * Called immediately after decoding a sequence of dots or dashes. 
     * MAKE SURE THIS METHOD PROCESSES DATA ASYNCHRONIOUSLY, AS THE DECODER WILL HANG UNTIL THIS METHOD RETURNED
     * @param c The decoded character
     */
    public void onCharDecoded(BalloonDataDecoder decoder,String c);
}