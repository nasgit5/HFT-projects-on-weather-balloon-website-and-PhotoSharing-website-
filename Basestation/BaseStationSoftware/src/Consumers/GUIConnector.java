/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package Consumers;

import GUI.MainForm;
import decoders.ExternalDecoder;
import decoders.MorseDecoder;
import decoders.common.BalloonDataDecoder;
import decoders.common.DataPackage;
import java.awt.EventQueue;

/**
 * Receives Data to be displayed in gui
 *
 * @author Michael Kolb
 */
public class GUIConnector extends AbstractBufferedConsumer {

    @Override
    protected boolean processBufferEntry(BufferEntry entry) {
        
            
        
        return true;
    }

    @Override
    public void onData(BalloonDataDecoder decoder, DataPackage data) {
        MainForm.getInstance().setLiveData(decoder,data);
    }

    
    
    @Override
    public void onSpectrumData(BalloonDataDecoder decoder, float[] spectrum) {
        final BalloonDataDecoder fdecoder = decoder;

        final float[] frawData = spectrum;
        EventQueue.invokeLater(new Runnable() {

            @Override
            public void run() {
                if (fdecoder instanceof MorseDecoder) {
                    MainForm.getInstance().displayMorseSpectrum(frawData);

                }

            }
        });
    }

    @Override
    public void onCharDecoded(BalloonDataDecoder decoder, String c) {
        final String C = c;
        final BalloonDataDecoder DECODER=decoder;
            EventQueue.invokeLater(new Runnable() {

                @Override
                public void run() {

                    MainForm.getInstance().addDecodedChar(DECODER,C);

                }
            });
        
    }

    @Override
    public void onDotDashDecoded(BalloonDataDecoder decoder, String c) {
        final String C = c;

        if (decoder instanceof MorseDecoder) {
            EventQueue.invokeLater(new Runnable() {

                @Override
                public void run() {

                    MainForm.getInstance().addDecodedSignal(C);

                }
            });
        }
    }

    @Override
    public void onRAWData(BalloonDataDecoder decoder, byte[] rawData) {
        final BalloonDataDecoder fdecoder = decoder;
        final byte[] frawData = rawData;
        EventQueue.invokeLater(new Runnable() {

            @Override
            public void run() {
                if (fdecoder instanceof MorseDecoder) {
                    MainForm.getInstance().displayMorseRAW(frawData);
                }

            }
        });

    }

}
