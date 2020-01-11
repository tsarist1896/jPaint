<?php
error_reporting(E_ALL); 
ini_set('display_errors', 'On');
set_time_limit(0);
date_default_timezone_set('Europe/Moscow');

define('ST_DEBUGING_R_PRE', 1);

function print_r_pre($object, $title = '', $script_die = true) {
	$key = '';
	$valid_key = (empty($key) || (!empty($key) && $key == ''));
	if(ST_DEBUGING_R_PRE && $valid_key) {
		if( !empty($title) ) {
			echo '<div style="position: fixed; bottom: 0; right: 0; background-color: #dedede; padding: 0.2em; min-height: 1.3em; box-shadow: -2px -2px 2px silver, -2px 2px 2px silver;">';
			print('<b>'.$title.'</b>');
			echo '</div>';
		}
		print('<pre>');
		print_r($object);
		if($script_die) {
			die('</pre>');
		}
		else {
			print('</pre>');
		}
	}
}
