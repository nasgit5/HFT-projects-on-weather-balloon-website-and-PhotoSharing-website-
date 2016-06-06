<?php
class DB {
	
	private $connection=null;
	
	public function DB(){
		$connection = sqlite_open('database.sqlite3', 0666, $error);

		if (!$dbhandle) die ($error);
	}
	
	public function addData($src,$seq,$volts,$hum,$itemp,$lat,$lon,$otemp,$pres) {
		$stm = "INSERT INTO log (daterec,voltage,humidity,itemp,otemp,lat,lon,pres,seq) VALUES (datetime('now'),$volts,$hum,$itemp,$lat,$lon,$otemp,$pres)";
		   $ok = sqlite_exec($dbhandle, $stm, $error);
    	   if(!$ok) die ($error);
	}
	
	public function fetch($from_date=null,$to_date=null){
		if(isset($from_date)) {
			$query='select * from log';
		} else {
			$query="select * from log WHERE datarec > $from_date AND datarec < $to_date";
		}
		
		$connection->arrayQuery($query);
	}
}
	
$db=new DB();

if($_POST["source"]){
	
	$src=$POST["source"];
	$seq=$POST["seq"];
	$volts=$POST["volts"];
	$hum=$POST["hum"];
	$itemp=$POST["itemp"];
	$lat=$POST["lat"];
	$lon=$POST["lon"];
	$otemp=$POST["otemp"];
	$pres=$POST["pres"];
	$db->addData($src,$seq,$volts,$hum,$itemp,$lat,$lon,$otemp,$pres)
	
} else {
	echo json_encode($db->fetch());
}

?>