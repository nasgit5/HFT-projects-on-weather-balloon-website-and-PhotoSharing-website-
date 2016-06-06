/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package Consumers;

import decoders.common.BalloonDataDecoder;
import java.io.File;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Class which logs all data to a database
 *
 * @author Michael Kolb
 */
public class DatabaseLogger extends AbstractBufferedConsumer {

    private Connection con;

    public DatabaseLogger(File dbLogfile) {
        try {
            Class.forName("org.sqlite.JDBC");

            con = DriverManager.getConnection("jdbc:sqlite:" + dbLogfile.toString());
            Statement stmt = con.createStatement();
            stmt.execute("CREATE TABLE IF NOT EXISTS log (id INTEGER PRIMARY KEY AUTOINCREMENT, daterec DATETIME,voltage FLOAT,humidity FLOAT,itemp FLOAT, otemp FLOAT, lat FLOAT, lon FLOAT, pres FLOAT, seq FLOAT)");
        } catch (ClassNotFoundException | SQLException ex) {
            Logger.getLogger(DatabaseLogger.class.getName()).log(Level.SEVERE, null, ex);
        }

    }

    @Override
    protected boolean processBufferEntry(BufferEntry entry) {
        try {
            PreparedStatement stmt = con.prepareStatement("INSERT INTO log (daterec,voltage,humidity,itemp,otemp,lat,lon,pres,seq) VALUES (datetime('now'),?,?,?,?,?,?,?,?)");
            stmt.setFloat(1, entry.DATA.getBatteryVoltage());
            stmt.setFloat(2, entry.DATA.getHumidity());
            stmt.setFloat(3, entry.DATA.getInsideTemp());
            stmt.setFloat(4, entry.DATA.getOutsideTemp());
            stmt.setFloat(5, entry.DATA.getLatitude());
            stmt.setFloat(6, entry.DATA.getLongitude());
            stmt.setFloat(7, entry.DATA.getPressure());
            stmt.setFloat(8, entry.DATA.getSequenceNo());

            stmt.execute();
            return true;

        } catch (SQLException ex) {
            Logger.getLogger(DatabaseLogger.class.getName()).log(Level.SEVERE, null, ex);
        }
        return false;
    }

}
