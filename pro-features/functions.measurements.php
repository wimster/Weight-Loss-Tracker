<?php

	defined('ABSPATH') or die("Jog on!");

function ws_ls_get_measurement_settings()
{
    if(defined('WE_LS_MEASUREMENTS_ENABLED') && WE_LS_MEASUREMENTS_ENABLED && defined('WE_LS_MEASUREMENTS') || is_admin()) {

        $settings = json_decode(WE_LS_MEASUREMENTS, true);

        // Settings specified in admin?
        if (get_option('ws-ls-measurement') != false) {

            $user_defined = get_option('ws-ls-measurement');
            if(isset($user_defined['colors'])) {
                foreach($user_defined['colors'] as $slug => $colour) {
                    $settings[$slug]['chart_colour'] = $colour;
                }
            }
            if(isset($user_defined['enabled'])) {
                foreach($user_defined['enabled'] as $slug => $enabled) {
                    if ('on' == $enabled) {
                        $settings[$slug]['enabled'] = true;
                    } else {
                        $settings[$slug]['enabled'] = false;
                    }
                }
            }
        }

        return $settings;
    }
    return false;
}
function ws_ls_any_active_measurement_fields(){
  $measurement_fields = ws_ls_get_measurement_settings();
  foreach($measurement_fields as $key => $data) {
      if($data['enabled']) {
          return true;
      }
  }
  return false;
}
function ws_ls_get_keys_for_active_measurement_fields($prefix = '', $remove_user_preferences = false){
  	$measurement_fields = ws_ls_get_measurement_settings();
	$keys = array();
	if ($measurement_fields) {
		foreach($measurement_fields as $key => $data) {
		  if($data['enabled']) {
			  if($remove_user_preferences && $data['user_preference']) {
				// Do nothing
			  } else {
				  $keys[] = $prefix . $key;
			  }
		  }
		}
	}
	return $keys;
}
function ws_ls_get_active_measurement_fields(){
  	$measurement_fields = ws_ls_get_measurement_settings();
	$keys = array();
	if ($measurement_fields) {
		foreach($measurement_fields as $key => $data) {
		  if($data['enabled'] && false == $data['user_preference']) {
			  $keys[$key] = $data;
		  }
		}
	}

	return $keys;
}

function ws_ls_load_measurement_form()
{
    $public_html = '';
    $measurement_fields = ws_ls_get_measurement_settings();

	  foreach($measurement_fields as $key => $data) {
        if($data['enabled'] && false == $data['user_preference']) {
            $public_html .= ws_ls_measurement_field($key, __($data['title'], WE_LS_SLUG) . ' (' . ws_ls_get_config('WE_LS_MEASUREMENTS_UNIT') . ')');
        }
    }

    return $public_html;
}

function ws_ls_measurement_field($field_id, $display_text, $value = false)
{
	$value = ($value) ? $value : '';
	$field_id = 'ws-ls-' . $field_id;

    $html_output = '<label for="' . $field_id . '">' . $display_text . ':</label>';
    $html_output .= '<input  type="number"' . ((WE_LS_MEASUREMENTS_MANDATORY) ? ' required' : '' ) . ' tabindex="' . ws_ls_get_next_tab_index() . '" step="any" min="0" max="1000" name="' . $field_id . '" id="' . $field_id . '" value="' . $value . '" size="11" class="ws-ls-measurement ws-ls-measurement-required"  />';
    return $html_output;
}

function ws_ls_prep_measurement($value) {

	if(0 === $value || '0' === $value || !is_numeric($value) || $value < 0) {
		return NULL;
	}

	return $value;
}
function ws_ls_prep_measurement_for_display($cm, $user_id = false) {

	if (!is_null($cm) && 'inches' == ws_ls_get_config('WE_LS_MEASUREMENTS_UNIT', $user_id)) {
		$inches = ws_ls_convert_to_inches($cm);
		return round($inches, 2);
	}

	return $cm;
}
