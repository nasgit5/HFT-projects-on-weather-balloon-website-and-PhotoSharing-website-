package test;

import static org.junit.Assert.*;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.lang.reflect.Field;

import org.junit.BeforeClass;
import org.junit.Test;

import output.Output;

public class OutputTest{

	static String fieldValue = "";
	static String content = "9.09969710;48.70126700;16.674;16.810;-13.785;-13.859;89.676;90.238;920.891;930.010;23000";
	
	@BeforeClass 
	public static void beforeClass(){
		Output o = new Output();
		o.writeToFile(content);
		Field privateStringField;
		try {
			privateStringField = Output.class.getDeclaredField("file");
			privateStringField.setAccessible(true);

			fieldValue = (String) privateStringField.get(o);
		} catch (NoSuchFieldException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (SecurityException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IllegalArgumentException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IllegalAccessException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}


	}
	
	@Test
	public void fileExists(){
		assertTrue(new File("../Output.txt").exists());
	}
	
	@Test
	public void isContentCorrect() throws IOException{
		
		BufferedReader br = new BufferedReader(new FileReader("../Output.txt"));
	    try {
	        StringBuilder sb = new StringBuilder();
	        String line = br.readLine();

	        while (line != null) {
	            sb.append(line);
	            line = br.readLine();
	        }
	        String everything = sb.toString();

	        assertEquals(everything,content);
	    } finally {
	        try {
				br.close();
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
	    }
		
	}
}