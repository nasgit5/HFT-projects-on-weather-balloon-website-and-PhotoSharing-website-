/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package decoders.common;

import basestationsoftware.Stopwatch;
import java.util.LinkedList;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Abstract class for receivers which provides handling for subscribers
 *
 * @author Michael Kolb
 */
public abstract class AbstractDecoder implements BalloonDataDecoder, Runnable {

    private final Stopwatch STOPWATCH = new Stopwatch();
    private final int INTERVAL;
    private Thread runner;
    private boolean doStop = false;

    private final List<BalloonDataHandler> SUBSCRIBERS = new LinkedList<>();

    @Override
    public void subscribe(BalloonDataHandler subscriber) {
        synchronized (SUBSCRIBERS) {
            if (!SUBSCRIBERS.contains(subscriber)) {
                SUBSCRIBERS.add(subscriber);
            }
        }
    }

    @Override
    public void unsubscribe(BalloonDataHandler subscriber) {
        synchronized (SUBSCRIBERS) {
            SUBSCRIBERS.remove(subscriber);
        }
    }

    private void fireRAWDataEvent(byte[] rawdata) {
        for (BalloonDataHandler balloonDataHandler : SUBSCRIBERS) {
            balloonDataHandler.onRAWData(this, rawdata.clone());
            synchronized (balloonDataHandler) {
                balloonDataHandler.notifyAll();
            }
        }

    }

    protected void fireDotDashDecoded(String s) {
        for (BalloonDataHandler balloonDataHandler : SUBSCRIBERS) {
            balloonDataHandler.onDotDashDecoded(this, s);
            synchronized (balloonDataHandler) {
                balloonDataHandler.notifyAll();
            }
        }

    }

    protected void fireCharDecoded(String s) {
        for (BalloonDataHandler balloonDataHandler : SUBSCRIBERS) {
            balloonDataHandler.onCharDecoded(this, s);
            synchronized (balloonDataHandler) {
                balloonDataHandler.notifyAll();
            }
        }

    }

    protected void fireSpectrumDataEvent(float[] rawdata) {
        for (BalloonDataHandler balloonDataHandler : SUBSCRIBERS) {
            balloonDataHandler.onSpectrumData(this, rawdata.clone());
            synchronized (balloonDataHandler) {
                balloonDataHandler.notifyAll();
            }
        }

    }

    /**
     * Fire the <code>onData</code> event on all subscribers
     *
     * @param data Data to send to the subscribers.
     */
    private void fireDataEvent(DataPackage data) {

        for (BalloonDataHandler balloonDataHandler : SUBSCRIBERS) {
            balloonDataHandler.onData(this, data);
            synchronized (balloonDataHandler) {
                balloonDataHandler.notifyAll();
            }

        }

    }

    /**
     * Fire the <code>onDecodingError</code> event to all subscribers
     *
     * @param error Error to be published to all subscribers
     */
    private void fireDecodingErrorEvent(DecodingException error) {

        for (BalloonDataHandler balloonDataHandler : SUBSCRIBERS) {
            balloonDataHandler.onDecodingError(this, error);
            synchronized (balloonDataHandler) {
                balloonDataHandler.notifyAll();
            }
        }

    }

    /**
     * Sleep interval after checking once for new data
     *
     * @param interval
     */
    public AbstractDecoder(int interval) {
        INTERVAL = interval;
    }

    public synchronized void setEnabled(boolean enabled) {

        if (enabled) {
            if (runner == null) {
                doStop = false;
                runner = new Thread(this);
                runner.start();
            }
        } else {
            doStop = true;
        }

    }

    /**
     * Start listening for data
     */
    public synchronized void listen() {
        setEnabled(true);

    }

    /**
     * Stop listening
     */
    public synchronized void stop() {
        doStop = true;
    }

    /**
     * Within this method the actual decoding is done (OSI layers > 1)
     *
     * @param data RAW data
     * @return extracted payload as object
     * @throws DecodingException Thrown on any decoding errors
     */
    protected abstract DataPackage decode(byte[] data) throws DecodingException;

    /**
     * This method retrieves raw data from hardware, and does basic checkings
     * like handshake or preamble checking (OSI layer 1)
     *
     * @return All received data.
     * @throws DecodingException
     */
    protected abstract byte[] fetchData() throws DecodingException;

    private void process() {
        try {
            byte rawdata[] = fetchData();
            if (rawdata != null) {
                fireRAWDataEvent(rawdata);
            }

            DataPackage payload = decode(rawdata);
            if (payload != null) {
                fireDataEvent(payload);
            }

        } catch (DecodingException ex) {
            Logger.getLogger(AbstractDecoder.class.getName()).log(Level.SEVERE, null, ex);
            fireDecodingErrorEvent(ex);
        }
    }

    @Override
    public void run() {
        while (!doStop) {
            STOPWATCH.start();
            process();
            STOPWATCH.stop();
            Logger.getLogger(this.getClass().getName()).log(Level.FINE, "Processing took {0}", STOPWATCH.toString());
            try {
                Thread.sleep(INTERVAL);

            } catch (InterruptedException ex) {
                Logger.getLogger(AbstractDecoder.class
                        .getName()).log(Level.SEVERE, null, ex);
            }
        }
    }

}
