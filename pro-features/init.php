<?php

defined('ABSPATH') or die("Jog on!");

// Include relevant files
if(defined('WS_LS_ABSPATH')){
	include WS_LS_ABSPATH . 'pro-features/functions.php';
	include WS_LS_ABSPATH . 'pro-features/user-preferences.php';
	include WS_LS_ABSPATH . 'pro-features/ajax-handler-public.php';
	include WS_LS_ABSPATH . 'pro-features/shortcode-chart.php';
	include WS_LS_ABSPATH . 'pro-features/shortcode-form.php';
	include WS_LS_ABSPATH . 'pro-features/shortcode-table.php';
	include WS_LS_ABSPATH . 'pro-features/shortcode-various.php';
	include WS_LS_ABSPATH . 'pro-features/shortcode-stats.php';
	include WS_LS_ABSPATH . 'pro-features/advanced-table.php';
	include WS_LS_ABSPATH . 'pro-features/widget-chart.php';
	include WS_LS_ABSPATH . 'pro-features/widget-form.php';
	include WS_LS_ABSPATH . 'pro-features/user-data.php';
	include WS_LS_ABSPATH . 'pro-features/user-data-ajax.php';
	include WS_LS_ABSPATH . 'pro-features/db.php';
	include WS_LS_ABSPATH . 'pro-features/functions.measurements.php';
	include WS_LS_ABSPATH . 'pro-features/functions.stats.php';
}

// Register shortcodes
function ws_ls_register_pro_shortcodes(){

    /*
        [weight-loss-tracker-chart] - Displays a chart
        [weight-loss-tracker-form] - Displays a form
        [weight-loss-tracker-table] - Displays a data table
		[weight-loss-tracker-most-recent-bmi] - Displays the user's BMI for most recent weight
		[weight-loss-tracker-total-lost] - Total lost / gained by the entire community.
		[weight-loss-tracker-league-table] - Show a league table of weight loss users.
    */

    add_shortcode( 'weight-loss-tracker-chart', 'ws_ls_shortcode_chart' );
    add_shortcode( 'weight-loss-tracker-form', 'ws_ls_shortcode_form' );
    add_shortcode( 'weight-loss-tracker-table', 'ws_ls_shortcode_table' );
	add_shortcode( 'weight-loss-tracker-most-recent-bmi', 'ws_ls_get_user_bmi' );
	add_shortcode( 'weight-loss-tracker-total-lost', 'ws_ls_shortcode_stats_total_lost' );
	add_shortcode( 'weight-loss-tracker-league-table', 'ws_ls_shortcode_stats_league_total' );


}
add_action( 'init', 'ws_ls_register_pro_shortcodes');

function ws_ls_enqueue_datatable_scripts($admin = false) {

    wp_enqueue_script('ws-ls-datatables', '//cdn.datatables.net/1.10.13/js/jquery.dataTables.js', array('jquery'), WE_LS_CURRENT_VERSION);
	wp_enqueue_style('ws-ls-datatables', '//cdn.datatables.net/1.10.13/css/jquery.dataTables.min.css', array(), WE_LS_CURRENT_VERSION);
	wp_enqueue_script('ws-ls-datatables', '//cdn.datatables.net/1.10.13/js/jquery.dataTables.js', array('jquery'), WE_LS_CURRENT_VERSION);
	wp_enqueue_script('ws-ls-datatables-responsive', '//cdn.datatables.net/responsive/2.1.0/js/dataTables.responsive.min.js', array('ws-ls-datatables'), WE_LS_CURRENT_VERSION);
    wp_enqueue_style('ws-ls-datatables-responsive', '//cdn.datatables.net/responsive/2.1.0/css/responsive.bootstrap.min.css', array(), WE_LS_CURRENT_VERSION);
    wp_enqueue_script('ws-ls-datatables-moment', '//cdnjs.cloudflare.com/ajax/libs/moment.js/2.13.0/moment.min.js', array('jquery', 'ws-ls-datatables-responsive'), WE_LS_CURRENT_VERSION);
    wp_enqueue_script('ws-ls-datatables-moment-date', '//cdn.datatables.net/plug-ins/1.10.11/sorting/datetime-moment.js', array('ws-ls-datatables-moment'), WE_LS_CURRENT_VERSION);

	// Setup config for advanced table (e.g. columns etc)
	if($admin) {
		wp_localize_script('ws-ls-datatables-responsive', 'ws_ls_config_advanced_datatables', ws_ls_get_advanced_table_admin_config());
	} else {
		wp_localize_script('ws-ls-datatables-responsive', 'ws_ls_config_advanced_datatables', ws_ls_get_advanced_table_config());
	}

	wp_localize_script('ws-ls-datatables-responsive', 'ws_ls_table_locale', ws_ls_advanced_table_locale());

}

// function ws_ls_enqeue_pro_scripts(){
//
//   if(WS_LS_ADVANCED_TABLES) {
// 	  ws_ls_enqueue_datatable_scripts();
//   }
// }
// add_action( 'wp_enqueue_scripts', 'ws_ls_enqeue_pro_scripts');

function ws_ls_admin_enqueue_pro_scripts(){

	// Only add Datatable scripts to User preferences page
 	$screen = get_current_screen();

    if ( 'weight-loss-tracker_page_ws-ls-weight-loss-tracker-pro' == $screen->id ){
		ws_ls_enqueue_datatable_scripts(true);
	}
}
add_action( 'admin_enqueue_scripts', 'ws_ls_admin_enqueue_pro_scripts');

function we_ls_register_widgets()
{
    register_widget( 'ws_ls_widget_chart' );
    register_widget( 'ws_ls_widget_form' );// Add locilzation data for JS
}
add_action( 'after_setup_theme', 'we_ls_register_widgets', 20 );
