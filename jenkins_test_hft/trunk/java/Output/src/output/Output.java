package output;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;

public class Output {
	
	private String file = "../Output.txt";
	public void writeToFile(String content){
		BufferedWriter writer = null;
        try {
            //create a temporary file
            File logFile = new File(file);

            // This will output the full path where the file will be written to...
            //System.out.println(logFile.getCanonicalPath());

            writer = new BufferedWriter(new FileWriter(logFile));
            writer.write(content);
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            try {
                // Close the writer regardless of what happens...
                writer.close();
            } catch (Exception e) {
            }
        }
	}

}
