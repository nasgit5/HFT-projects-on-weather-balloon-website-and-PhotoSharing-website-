// HectoPascal instead of Pascal
var useHecto = true;

 // Singlevalued constants
var R = 8.31432; // Universal gas constant for air (N·m /(mol·K))
var M = 0.0289644; // Molar mass of Earth's air (kg/mol)
var g0 = 9.80665; // Gravitational acceleration (m/s2)

// Multivalued constants
// The subscript value ranges from 0 to 6 in accordance with the 7 lower successive layers of the atmosphere
// 0 = Troposphere, 1 = Tropopause, 2+3 = Stratosphere, 4 = Stratopause, 5+6 = Mesosphere
// Temperature at lower bound of different atmosphere layers
var t0 = 288.15, t1 = 216.65, t2 = 216.65, t3 = 228.65, t4 = 270.65, t5 = 270.65, t6 = 214.65;
// Temperature Lapse Rate at lower bound of different atmosphere layers
var l0 = -0.0065, l1 = 0.0000001, l2 = 0.001, l3 = 0.0028, l4 = 0.0000001, l5 = -0.0028, l6 = -0.002;
// Altitude at lower bound of different atmosphere layers
var h0 = 0, h1 = 11000, h2 = 20000, h3 = 32000, h4 = 47000, h5 = 51000, h6 = 71000;

// Pressure at lower bound of different atmosphere layers
// Used for calibration
var p0 = 101325.0, p1 = 22632.1, p2 = 5474.89, p3 = 868.02, p4 = 110.91, p5 = 66.94, p6 = 3.96;

exports.calibrate = function(pressure, height)
    {
        // Calibration using a pressure value and a corresponding correct height
        // The calibration consists of the calculation of new 
        // pressure values for every atmosphere layer bound
        
        // First the lowest pressure of the actual layer is calculated
        // Second the lowest pressures of all layers beneath the actual layer
        // are calculated (only for tropopause and higher)
        // Third the lowest pressures of all layers higher than the actual layer
        // are calculated. This is achieved by calculating the pressure at the top
        // of the layer immediately beneath the considered layer
		
        // Troposphere
        if(pressure > p1)
        {
            p0 = pressure * Math.pow((t0)/(t0+l0*(height-h0)),(-g0*M)/(R*l0));
            
            p1 = p0 * Math.pow((t0)/(t0+l0*(h1-h0)), (g0*M)/(R*l0));
            p2 = p1 * Math.pow((t1)/(t1+l1*(h2-h1)), (g0*M)/(R*l1));
            p3 = p2 * Math.pow((t2)/(t2+l2*(h3-h2)), (g0*M)/(R*l2));
            p4 = p3 * Math.pow((t3)/(t3+l3*(h4-h3)), (g0*M)/(R*l3));
            p5 = p4 * Math.pow((t4)/(t4+l4*(h5-h4)), (g0*M)/(R*l4));
            p6 = p5 * Math.pow((t5)/(t5+l5*(h6-h5)), (g0*M)/(R*l5));
        }
        // Tropopause
        else if(pressure > p2)
        {
            p1 = pressure * Math.pow((t1)/(t1+l1*(height-h1)),(-g0*M)/(R*l1));
            
            p0 = p1 * Math.pow((t0)/(t0+l0*(h1-h0)), (-g0*M)/(R*l0));
            
            p2 = p1 * Math.pow((t1)/(t1+l1*(h2-h1)), (g0*M)/(R*l1));
            p3 = p2 * Math.pow((t2)/(t2+l2*(h3-h2)), (g0*M)/(R*l2));
            p4 = p3 * Math.pow((t3)/(t3+l3*(h4-h3)), (g0*M)/(R*l3));
            p5 = p4 * Math.pow((t4)/(t4+l4*(h5-h4)), (g0*M)/(R*l4));
            p6 = p5 * Math.pow((t5)/(t5+l5*(h6-h5)), (g0*M)/(R*l5));
        }
        // Stratosphere I
        else if(pressure > p3)
        {
            p2 = pressure * Math.pow((t2)/(t2+l2*(height-h2)),(-g0*M)/(R*l2));
            
            p1 = p2 * Math.pow((t1)/(t1+l1*(h2-h1)), (-g0*M)/(R*l1));
            p0 = p1 * Math.pow((t0)/(t0+l0*(h1-h0)), (-g0*M)/(R*l0));
            
            p3 = p2 * Math.pow((t2)/(t2+l2*(h3-h2)), (g0*M)/(R*l2));
            p4 = p3 * Math.pow((t3)/(t3+l3*(h4-h3)), (g0*M)/(R*l3));
            p5 = p4 * Math.pow((t4)/(t4+l4*(h5-h4)), (g0*M)/(R*l4));
            p6 = p5 * Math.pow((t5)/(t5+l5*(h6-h5)), (g0*M)/(R*l5));
        }
        // Stratosphere II
        else if(pressure > p4)
        {
            p3 = pressure * Math.pow((t3)/(t3+l3*(height-h3)),(-g0*M)/(R*l3));
            
            p2 = p3 * Math.pow((t2)/(t2+l2*(h3-h2)), (-g0*M)/(R*l2));
            p1 = p2 * Math.pow((t1)/(t1+l1*(h2-h1)), (-g0*M)/(R*l1));
            p0 = p1 * Math.pow((t0)/(t0+l0*(h1-h0)), (-g0*M)/(R*l0));
            
            p4 = p3 * Math.pow((t3)/(t3+l3*(h4-h3)), (g0*M)/(R*l3));
            p5 = p4 * Math.pow((t4)/(t4+l4*(h5-h4)), (g0*M)/(R*l4));
            p6 = p5 * Math.pow((t5)/(t5+l5*(h6-h5)), (g0*M)/(R*l5));
        }
        // Stratopause
        else if(pressure > p5)
        {
            p4 = pressure * Math.pow((t4)/(t4+l4*(height-h4)),(-g0*M)/(R*l4));
            
            p3 = p4 * Math.pow((t3)/(t3+l3*(h4-h3)), (-g0*M)/(R*l3));
            p2 = p3 * Math.pow((t2)/(t2+l2*(h3-h2)), (-g0*M)/(R*l2));
            p1 = p2 * Math.pow((t1)/(t1+l1*(h2-h1)), (-g0*M)/(R*l1));
            p0 = p1 * Math.pow((t0)/(t0+l0*(h1-h0)), (-g0*M)/(R*l0));
            
            p5 = p4 * Math.pow((t4)/(t4+l4*(h5-h4)), (g0*M)/(R*l4));
            p6 = p5 * Math.pow((t5)/(t5+l5*(h6-h5)), (g0*M)/(R*l5));
        }
        // Mesosphere I
        else if(pressure > p6)
        {
            p5 = pressure * Math.pow((t5)/(t5+l5*(height-h5)),(-g0*M)/(R*l5));
            
            p4 = p5 * Math.pow((t4)/(t4+l4*(h5-h4)), (-g0*M)/(R*l4));
            p3 = p4 * Math.pow((t3)/(t3+l3*(h4-h3)), (-g0*M)/(R*l3));
            p2 = p3 * Math.pow((t2)/(t2+l2*(h3-h2)), (-g0*M)/(R*l2));
            p1 = p2 * Math.pow((t1)/(t1+l1*(h2-h1)), (-g0*M)/(R*l1));
            p0 = p1 * Math.pow((t0)/(t0+l0*(h1-h0)), (-g0*M)/(R*l0));
            
            p6 = p5 * Math.pow((t5)/(t5+l5*(h6-h5)), (g0*M)/(R*l5));
        }
        // Mesosphere II
        else
        {
            p6 = pressure * Math.pow((t6)/(t6+l6*(height-h6)),(-g0*M)/(R*l6));
            
            p5 = p6 * Math.pow((t5)/(t5+l5*(h6-h5)), (-g0*M)/(R*l5));
            p4 = p5 * Math.pow((t4)/(t4+l4*(h5-h4)), (-g0*M)/(R*l4));
            p3 = p4 * Math.pow((t3)/(t3+l3*(h4-h3)), (-g0*M)/(R*l3));
            p2 = p3 * Math.pow((t2)/(t2+l2*(h3-h2)), (-g0*M)/(R*l2));
            p1 = p2 * Math.pow((t1)/(t1+l1*(h2-h1)), (-g0*M)/(R*l1));
            p0 = p1 * Math.pow((t0)/(t0+l0*(h1-h0)), (-g0*M)/(R*l0));
        }
    }

exports.calcAltitudeWithLapseRate = function(pressure)
    {
        var hb; // Height at bottom of layer b (meters)
        var pb; // Static pressure (pascals)
        var tb; // Standard temperature (K)
        var lb; // Standard temperature lapse rate (K/m)
		
		if(useHecto)
			pressure = pressure * 100;
        
        // Set multivalued constants according to actual atmosphere layer
        // Troposphere
        if(pressure > p1)
        {
            hb = h0;
            pb = p0;
            tb = t0;
            lb = l0;
        }
        // Tropopause
        else if(pressure > p2)
        {
            hb = h1;
            pb = p1;
            tb = t1;
            lb = l1;
        }
        // Stratosphere I
        else if(pressure > p3)
        {
            hb = h2;
            pb = p2;
            tb = t2; // no change standard temperature
            lb = l2;
        }
        // Stratosphere II
        else if(pressure > p4)
        {
            hb = h3;
            pb = p3;
            tb = t3; 
            lb = l3;
        }
        // Stratopause
        else if(pressure > p5)
        {
            hb = h4;
            pb = p4;
            tb = t4;
            lb = l4;
        }
        // Mesosphere I
        else if(pressure > p6)
        {
            hb = h5;
            pb = p5;
            tb = t5;
            lb = l5;
        }
        // Mesosphere II
        else
        {
            hb = h6;
            pb = p6;
            tb = t6;
            lb = l6;
        }
        
        // Calculate using ISA model formula 
        var altitude = hb - (tb/lb) + ( tb / (lb*( Math.pow(pressure/pb, ((R*lb)/(g0*M))) ) ) );
		
		console.log("**************************************** returning altitude: " + altitude);
        
        return altitude;
    }

	
exports.calcAltitudeWithoutLapseRate = function(pressure)
{
	// Calculating altitude from pressure ignoring the lapse rate of temperature
	// within an atmosphere layer
	
	var hb; // Height at bottom of layer b (meters)
	var pb; // Static pressure (pascals)
	var tb; // Standard temperature (K)

	if(useHecto)
		pressure = pressure * 100;
		
	// Set multivalued constants according to actual atmosphere layer
	// Troposphere
	if(pressure > p1)
	{
		hb = h0;
		pb = p0;
		tb = t0;
	}
	// Tropopause
	else if(pressure > p2)
	{
		hb = h1;
		pb = p1;
		tb = t1;
	}
	// Stratosphere I
	else if(pressure > p3)
	{
		hb = h2;
		pb = p2;
		tb = t2; 
	}
	// Stratosphere II
	else if(pressure > p4)
	{
		hb = h3;
		pb = p3;
		tb = t3; 
	}
	// Stratopause
	else if(pressure > p5)
	{
		hb = h4;
		pb = p4;
		tb = t4;
	}
	// Mesosphere I
	else if(pressure > p6)
	{
		hb = h5;
		pb = p5;
		tb = t5;
	}
	// Mesosphere II
	else
	{
		hb = h6;
		pb = p6;
		tb = t6;
	}
	
	// Calculate using ISA model formula 
	var altitude = hb - ((R*tb)/(g0*M)) * Math.log(pressure/pb);
	
	console.log("**************************************** returning altitude: " + altitude);
	return altitude;
}