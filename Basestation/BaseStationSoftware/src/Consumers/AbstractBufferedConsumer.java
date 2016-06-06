/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package Consumers;

import decoders.common.BalloonDataDecoder;
import decoders.common.BalloonDataHandler;
import decoders.common.DataPackage;
import decoders.common.DecodingException;
import java.util.Queue;
import java.util.concurrent.ConcurrentLinkedDeque;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Baseclass for consumers. This provides basic buffering methods
 *
 * @author Michael Kolb
 */
public abstract class AbstractBufferedConsumer implements BalloonDataHandler, Runnable {

    private final Queue<BufferEntry> BUFFER = new ConcurrentLinkedDeque<>();

    @Override
    public void onDotDashDecoded(BalloonDataDecoder decoder, String c) {

    }

    @Override
    public void onCharDecoded(BalloonDataDecoder decoder, String c) {

    }

    protected class BufferEntry {

        /**
         * Contains the payload. See <code>DataPackage</code> for details.
         */
        public final DataPackage DATA;
        /**
         * Identifier of the data source. This is specified by the decoder and
         * is equal to the <code>identifier</code> field of the decoder.
         */
        public final String SOURCE;

        public BufferEntry(DataPackage DATA, String SOURCE) {
            this.DATA = DATA;
            this.SOURCE = SOURCE;
        }

    }

    Thread thread;

    public synchronized void start() {
        if (thread == null) {
            thread = new Thread(this);
            thread.start();
        }
    }

    /**
     * Implement this for processing buffer entries.
     *
     * @param entry Entry to process
     * @return true if the entry has been processed sucessfull and therefore can
     * be removed from buffer, false if not
     */
    protected abstract boolean processBufferEntry(BufferEntry entry);

    @Override
    public void run() {
        while (true) {
            while (!BUFFER.isEmpty()) {
                boolean processed = processBufferEntry(BUFFER.peek());
                if (processed) {
                    BUFFER.poll();
                }
            }
            synchronized (this) {
                try {
                    this.wait();
                } catch (InterruptedException ex) {
                    Logger.getLogger(AbstractBufferedConsumer.class.getName()).log(Level.SEVERE, null, ex);
                }
            }

        }
    }

    @Override
    public void onDecodingError(BalloonDataDecoder decoder, DecodingException ex) {
        //TODO check if errors have to be sent to the server, if so, implement
        Logger.getLogger(AbstractBufferedConsumer.class.getName()).log(Level.WARNING, null, ex);
    }

    @Override
    public void onData(BalloonDataDecoder decoder, DataPackage data) {
        BUFFER.add(new BufferEntry(data, decoder.identifier()));
        Logger.getLogger(this.getClass().getName()).log(Level.FINE, null, "Buffer contains " + BUFFER.size() + " entrys");
    }

    @Override
    public void onSpectrumData(BalloonDataDecoder decoder, float[] spectrum) {

    }

    @Override
    public void onRAWData(BalloonDataDecoder decoder, byte[] rawData) {

    }

}
