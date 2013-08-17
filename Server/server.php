<?php
	$values = $_REQUEST;
	if(isset($values['id']) and isset($values['x']) and isset($values['y']) and isset($values['time'])){
		$x = $values['x'];
		$y = $values['y'];
		$id = $values['id'];
		$time = $values['time'];
		// Set database x + y to values
		$return = json_encode(); // Return other player's data
		echo json_encode($return);
	}elseif(isset($values['getID']){
		
	}