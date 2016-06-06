package mock;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.net.*;
import com.google.gson.Gson;

public class SConnect implements Runnable {

	//private static double lon = 9.17702;
	private static double lon = 9.20121;
	//private static double lat = 48.782318;
	private static double lat = 48.82857;
	private static float humidity = 55;
	private static float otemp = 13;
	private static float itemp = 14;
	private static float voltage = 100;
	private static float pres = 1026;
	private static float altitude = 248;
	private static float precision = 0.5f;

	public static void main(String[] args) {
		Thread t = new Thread(new SConnect());
		t.run();
	}

	private static void sendPost(String data) {
		System.out.println(data);
		URL url;
		try {
			url = new URL("http://localhost:8000/json");
			HttpURLConnection connection = (HttpURLConnection) url
					.openConnection();
			connection.setRequestMethod("POST");
			connection.setDoOutput(true);
			connection.setDoInput(true);
			connection.setUseCaches(false);
			connection.setRequestProperty("Content-Type", "application/text");
			connection.setRequestProperty("Cache-Control", "no-cache");
			connection.setRequestProperty("Content-Length",
					String.valueOf(data.length()));
			OutputStreamWriter out = new OutputStreamWriter(
					connection.getOutputStream());

			try {
				out.write(data);
				out.close();
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}

			BufferedReader br = new BufferedReader(new InputStreamReader(
					connection.getInputStream()));
			System.out.println("deb 2");
			StringBuffer sb = new StringBuffer();
			String str = br.readLine();
			while (str != null) {
				sb.append(str);
				str = br.readLine();
				System.out.println(str);
			}

			br.close();
			String responseString = sb.toString();
			System.out.println(responseString);
		} catch (MalformedURLException e1) {
			// TODO Auto-generated catch block
			e1.printStackTrace();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

	}

	@Override
	public void run() {
		DataObject data = new DataObject(lon, lat, humidity, otemp, itemp,
				voltage, pres, altitude);
		while (true) {
			Gson gson = new Gson();
			sendPost(gson.toJson(data.getNextObject()));
			try {
				Thread.sleep(5000); // more realistic frequency
			} catch (InterruptedException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		}
	}

}
