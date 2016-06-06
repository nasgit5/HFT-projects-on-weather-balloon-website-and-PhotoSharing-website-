/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package decoders;

import com.badlogic.audio.analysis.FFT;
import decoders.Filters.FrequencyFilter;
import decoders.Filters.PeakDetector;
import decoders.Filters.SquelchFilter;
import decoders.common.AbstractDecoder;
import decoders.common.DataPackage;
import decoders.common.DecodingException;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.Map;
import java.util.Queue;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.sound.sampled.AudioFormat;
import javax.sound.sampled.AudioSystem;
import javax.sound.sampled.DataLine;
import javax.sound.sampled.LineUnavailableException;
import javax.sound.sampled.TargetDataLine;

/**
 * Decoder for Morse signals. A Morse frame is encoded like in this example:

 *
 * @author Michael Kolb
 */
public class MorseDecoder extends AbstractDecoder {

    /**
     * Retrieve N samples per second from the soundcard
     */
    private final float SAMPLE_RATE = 44.1f*1000;
    /**
     * Number of bits per sample
     */
    private final int SAMPLE_SIZE_IN_BITS = 8;
    /**
     * Mono recording
     */
    private final int CHANNELS = 1; //Mono

    /**
     * Use signed numbers
     */
    private final boolean SIGNED = true;
    /**
     * Use big endian byteorder for samples
     */
    private final boolean BIG_ENDIAN = true;

    private final AudioFormat FORMAT;
    private final TargetDataLine LINE;

    /**
     * How long is our rx buffer. This is heavily dependant on the above
     * settings, so DON'T CHANGE ANYTHING UNLESS YOU KNOW WHAT YOU ARE DOING!
     */
    private final int BUFFER_LENGTH_IN_BYTES = 512;
    private final byte[] DATA;

    /**
     * This class does the actual conversion from frequency peaks to human
     * readable text
     *
     * @author Michael Kolb
     */
    public class MorseCodeTranslator {

        
        /*
        //STANDARD RATIO
        private final int DOT_LENGTH = 14;
        private final int DASH_LENGTH = DOT_LENGTH * 3;
        private final int PAUSE_BETWEEN_ELEMENTS = DOT_LENGTH;
        private final int PAUSE_BETWEEN_CHARACTERS = DOT_LENGTH * 3;
        private final int PAUSE_BETWEEN_WORDS = DOT_LENGTH * 7;
*/
        private final int LENGTH_TOLERANCE=3;
        private final int DOT_LENGTH = 14;
        private final int DASH_LENGTH = 36;
        private final int PAUSE_BETWEEN_ELEMENTS = 5;
        private final int PAUSE_BETWEEN_CHARACTERS = 26;
        private final int PAUSE_BETWEEN_WORDS = 68;
        
        
        
        private float PEAK_LEVEL_THRESHOLD = 100;

        private final Map<String, String> MORSE_CODE = new HashMap<>();

        {
            MORSE_CODE.put(".-", "A");
            MORSE_CODE.put("-...", "B");
            MORSE_CODE.put("-.-.", "C");
            MORSE_CODE.put("-..", "D");
            MORSE_CODE.put(".", "E");
            MORSE_CODE.put("..-.", "F");
            MORSE_CODE.put("--.", "G");
            MORSE_CODE.put("....", "H");
            MORSE_CODE.put("..", "I");
            MORSE_CODE.put(".---", "J");
            MORSE_CODE.put("-.-", "K");
            MORSE_CODE.put(".-..", "L");
            MORSE_CODE.put("--", "M");
            MORSE_CODE.put("-.", "N");
            MORSE_CODE.put("---", "O");
            MORSE_CODE.put(".--.", "P");
            MORSE_CODE.put("--.-", "Q");
            MORSE_CODE.put(".-.", "R");
            MORSE_CODE.put("...", "S");
            MORSE_CODE.put("-", "T");
            MORSE_CODE.put("..-", "U");
            MORSE_CODE.put("...-", "V");
            MORSE_CODE.put(".--", "W");
            MORSE_CODE.put("-..-", "X");
            MORSE_CODE.put("-.--", "Y");
            MORSE_CODE.put("--..", "Z");
            MORSE_CODE.put("-.-.-", "KA"); //Begin of transmission
            MORSE_CODE.put(".-.-.", "AR"); //End of transmission
            MORSE_CODE.put("-----", "0");
            MORSE_CODE.put(".----", "1");
            MORSE_CODE.put("..---", "2");
            MORSE_CODE.put("...--", "3");
            MORSE_CODE.put("....-", "4");
            MORSE_CODE.put(".....", "5");
            MORSE_CODE.put("-....", "6");
            MORSE_CODE.put("--...", "7");
            MORSE_CODE.put("---..", "8");
            MORSE_CODE.put("----.", "9");
            MORSE_CODE.put(".−.−.−", ".");
            MORSE_CODE.put("−−..−−", ",");
        }

        Queue<Boolean> BUFFER = new LinkedList<>();

        private boolean binarize(float value) {

            return (value > PEAK_LEVEL_THRESHOLD);
        }

        
        
        int lastStateChangeSampleNo=0;
        boolean currentState = false;
        

        StringBuffer dotDashBuffer = new StringBuffer();

        StringBuffer messageBuffer = new StringBuffer();
        /**
         * Add a value for detecting signals.
         *
         * @param value
         */
        public void add(float value,int sampleNo) {
            boolean newState = binarize(value);
            boolean doDecode = false;
            float delay = sampleNo - lastStateChangeSampleNo;
            if (currentState != newState) {

                if (currentState == true) {
                    System.out.println("\nSignal. "+delay+" f");
                    if (Math.abs(delay - DASH_LENGTH) <= LENGTH_TOLERANCE) {
                        dotDashBuffer.append("-");
                        fireDotDashDecoded("-");
                        
                    } else if (Math.abs(delay - DOT_LENGTH) <= LENGTH_TOLERANCE) {
                        dotDashBuffer.append(".");
                        fireDotDashDecoded(".");
                    } else {
                        System.err.println("Unkown signal with " + delay + " f duration");
                    }

                } else {
                    System.out.println("\nPause. "+delay+" f");
                    if (Math.abs(delay - PAUSE_BETWEEN_WORDS) <= LENGTH_TOLERANCE) { //pause between words
                        fireDotDashDecoded("    ");
                        fireCharDecoded(" ");
                        doDecode = true;
                    } else if (Math.abs(delay - PAUSE_BETWEEN_CHARACTERS) <= LENGTH_TOLERANCE) { //pause between chars
                        fireDotDashDecoded(" ");
                        doDecode = true;
                    } else if (Math.abs(delay - PAUSE_BETWEEN_ELEMENTS) <= LENGTH_TOLERANCE) { //pause within a char

                    }

                }
                currentState = newState;
                lastStateChangeSampleNo = sampleNo;

            }

            if ((doDecode || delay > PAUSE_BETWEEN_WORDS * 2) && dotDashBuffer.length() > 0) {
                String decoded = MORSE_CODE.get(dotDashBuffer.toString());
                fireCharDecoded(decoded);
                messageBuffer.append(decoded);
                dotDashBuffer = new StringBuffer();
            }

        }

        
        public DataPackage getDataPackage(){
            //TODO implement
            return null;
        }
        public synchronized void setPeakBorder(float border) {
            PEAK_LEVEL_THRESHOLD = border;
        }

    }

    public MorseDecoder() {
        super(0);

        FORMAT = new AudioFormat(SAMPLE_RATE, SAMPLE_SIZE_IN_BITS, CHANNELS, SIGNED, BIG_ENDIAN);
        LINE = getTargetDataLine();

        int bufsize = (int) (FORMAT.getFrameSize() * FORMAT.getFrameRate() / 2.0f);
        System.out.println(bufsize);
        DATA = new byte[BUFFER_LENGTH_IN_BYTES];

        LINE.start();
    }

    private TargetDataLine getTargetDataLine() {
        TargetDataLine result = null;
        final DataLine.Info info = new DataLine.Info(TargetDataLine.class, FORMAT);

        if (AudioSystem.isLineSupported(info)) {
            try {
                result = (TargetDataLine) AudioSystem.getLine(info);
                result.open(FORMAT, result.getBufferSize());
            } catch (LineUnavailableException ex) {
                Logger.getLogger(MorseDecoder.class.getName()).log(Level.SEVERE, null, ex);
            }
        }

        return result;
    }

    private final SquelchFilter SQUELCH_FILTER = new SquelchFilter();
    private final MorseCodeTranslator TRANSLATOR = new MorseCodeTranslator();
    private final PeakDetector PEAK_DETECTOR = new PeakDetector(5);
    private final FrequencyFilter FREQ_FILTER = new FrequencyFilter();

    
    private int sampleNo=0;
    @Override
    protected DataPackage decode(byte[] data) throws DecodingException {
        sampleNo++;
        
        Logger.getLogger(this.getClass().getName()).log(Level.FINER, "FFT Buffer Length: {0}", BUFFER_LENGTH_IN_BYTES);
        FFT fft = new FFT(BUFFER_LENGTH_IN_BYTES, SAMPLE_RATE);

        fft.forward(b2fArray(DATA));
        float[] spectrum = fft.getSpectrum();

        spectrum = SQUELCH_FILTER.apply(spectrum);

        fireSpectrumDataEvent(spectrum);

        spectrum = FREQ_FILTER.apply(spectrum);

        int peakIndex = PEAK_DETECTOR.detect(spectrum);
        float peakValue = 0;
        if (peakIndex > 0) {
            peakValue = spectrum[peakIndex];
            
        }
        TRANSLATOR.add(peakValue,sampleNo);
        

        
        return TRANSLATOR.getDataPackage();
    }

    private float[] b2fArray(byte[] array) {
        float[] result = new float[array.length];
        for (int i = 0; i < array.length; i++) {
            result[i] = array[i];

        }
        return result;
    }

    @Override
    protected byte[] fetchData() throws DecodingException {
        int numBytesRead = LINE.read(DATA, 0, BUFFER_LENGTH_IN_BYTES);
        if (numBytesRead != -1) {
            return DATA.clone();
        }
        return null;
    }

    @Override
    public String identifier() {
        return "CW";
    }

    /**
     * Sets squelch value
     *
     * @param squelchValue Value between 0 and 100
     */
    public void setSquelch(int squelchValue) {
        SQUELCH_FILTER.setSquelch(squelchValue);
    }

    /**
     * Sets the index of the spectrum array where the signal detection will take
     * place
     *
     * @param markerIndex
     */
    public void setDetectionIndex(Integer markerIndex) {
        FREQ_FILTER.setBounds(markerIndex - 2, markerIndex + 2);
    }

    public void setSignalBorder(float value) {
        TRANSLATOR.setPeakBorder(value);
    }
}
