/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

package decoders.common;



/**
 * Interface which is implemented by a class that actually receives "raw" data from the balloon.
 * This can be a class which simply forwards serial data, or a class like a simulator, just for testing.
 * The implementing class does deconding on its on, so only the payload will be published to the subscribers
 * !!! YOU MIGHT BE CALLED OUT OF ANOTHER THREAD IF YOU SUBSCRIBE !!!
 * @author Michael Kolb
 */
public interface BalloonDataDecoder {
    /**
     * Tell the broadcaster that you are interested in received data
     * @param subscriber The subscriber which will receive the data
     */
    public void subscribe(BalloonDataHandler subscriber);
    /**
     * Tell the broadcaster that you are no longer interested in received data
     * @param subscriber The subscriber that should be removed from the subscription list
     */
    public void unsubscribe(BalloonDataHandler subscriber);

    /**
     * Returns a (one word!) short description of the data source (E.g. SMS, PR, MORSE)
     * @return 
     */
    public String identifier();
}
