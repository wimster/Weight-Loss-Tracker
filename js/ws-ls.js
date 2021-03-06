$tabs_global = false;

jQuery( document ).ready(function ($) {
	if ('true' == ws_ls_config['advanced-tables-enabled']) {

	    if ('true' == ws_ls_config['us-date']) {
	      $.fn.dataTable.moment( 'MM/DD/YYYY' );
	    }
	    else {
	        $.fn.dataTable.moment( 'DD/MM/YYYY' );
	    }

	    $('.ws-ls-advanced-data-table').DataTable( {
            "responsive":true,
			"order": [[ 1, "desc" ]],
			"lengthMenu": [[10, 25, 50, -1], [10, 25, 50, "All"]],
            "columnDefs": ws_ls_config_advanced_datatables['columns'],
            "language": ws_ls_table_locale
        });

   }
	function ws_ls_edit_row(){

	}
   // Delete / Edit links on tables
  $('.ws-ls-edit-row').click(function( event ) {
      event.preventDefault();

      $post_data = {};

      $post_data['action'] = 'ws_ls_get_entry';
      $post_data['security'] = ws_ls_config['ajax-security-nonce'];
      $post_data['user-id'] = ws_ls_config['user-id'];
      $post_data['row-id'] = $(this).data('row-id');
      $post_data['form-id'] = $('.ws-ls-main-weight-form').attr('id');

      ws_ls_post_data($post_data, ws_ls_edit_row_callback);
  });
  $('.ws-ls-delete-row').click(function( event ) {
      event.preventDefault();

      if(!confirm(ws_ls_config['confirmation-delete'])){
          return;
      }

      var tr = $(this).closest('tr');
      var table = $(this).closest('table');

      $post_data = {};

      $post_data['action'] = 'ws_ls_delete_weight_entry';
      $post_data['security'] = ws_ls_config['ajax-security-nonce'];
      $post_data['user-id'] = ws_ls_config['user-id'];
      $post_data['table-row-id'] = tr.attr('id');
      $post_data['table-id'] = table.attr('id');
      $post_data['row-id'] = $(this).data('row-id');

      ws_ls_post_data($post_data, ws_ls_delete_row_callback);
  });

  function ws_ls_delete_row_callback(data, response)
  {
    if (response == 1) {

      var table = $('#' + data['table-id']).DataTable();
      var tr = $('#' + data['table-row-id']);

      table
          .row(tr)
          .remove()
          .draw();

      ws_ls_show_you_need_to_refresh_messages();
    }
    else
    {
      console.log('Error deleting entry :(', data, response);
    }
  }
    $('.ws-ls-clear-target').click(function( event ) {
      event.preventDefault();

      if(!confirm(ws_ls_config['clear-target'])){
          return;
      }

      $post_data = {};
      $post_data['action'] = 'ws_ls_clear_target';
      $post_data['security'] = ws_ls_config['ajax-security-nonce'];
      $post_data['user-id'] = ws_ls_config['user-id'];

      ws_ls_post_data($post_data, ws_ls_clear_target_callback);
  });

  function ws_ls_clear_target_callback(data, response)
  {
    if (response == 1) {
      ws_ls_show_you_need_to_refresh_messages();
    }
    else
    {
      console.log('Error clearing target :(', data, response);
    }
  }

  function ws_ls_edit_row_callback(data, response)
  {
    if (response != 0) {

        if ('true' == ws_ls_config['us-date']) {
          $('#' + data['form-id'] + ' .we-ls-datepicker').val(response['date-us']);
        }
        else {
          $('#' + data['form-id'] + ' .we-ls-datepicker').val(response['date-uk']);
        }

        $weight_unit = $('#' + data['form-id']).data('metric-unit');

        if('imperial-pounds' == $weight_unit) {
            $('#' + data['form-id'] + ' #we-ls-weight-pounds').val(response['only_pounds']);
        }
        if('imperial-both' == $weight_unit)
        {
            $('#' + data['form-id'] + ' #we-ls-weight-stones').val(response['stones']);
            $('#' + data['form-id'] + ' #we-ls-weight-pounds').val(response['pounds']);
        }
        if('metric' == $weight_unit)
        {
            $('#' + data['form-id'] + ' #we-ls-weight-kg').val(response['kg']);
        }
        $('#' + data['form-id'] + ' #we-ls-notes').val(response['notes']);

        if ('true' == ws_ls_config['tabs-enabled']) {
            $tabs_global.data("zozoTabs").first();
        }

		// Measurements?
		if(response['measurements'] != false) {
			var measurements = response['measurements'];
			for (var k in measurements) {
		        if (measurements.hasOwnProperty(k)) {
				   $('#' + data['form-id'] + ' #ws-ls-' + k).val(measurements[k]);
		        }
		    }
		}

        // Set focus on edit form
        $('.ws-ls-main-weight-form input:visible:nth-child(3)').focus();
    }
    else
    {
      console.log('Error loading entry :(', data, response);
    }
  }

  function ws_ls_show_you_need_to_refresh_messages() {

    $('.ws-ls-notice-of-refresh').removeClass('ws-ls-hide');

  }


});

jQuery( document ).ready(function ($) {

  if ('true' == ws_ls_config['tabs-enabled']) {

    $default_tab = 'tab1';

    var wsLSTabsReady = function(event, item) {
        $('#ws-ls-tabs-loading').addClass('ws-ls-hide');
        $('#' + item.id).attr('style', '');
	};

    $tabs_global = $("#ws-ls-tabs").zozoTabs({
        rounded: false,
         multiline: true,
         theme: "silver",
         size: "medium",
         responsive: true,
         animation: {
             effects: "slideH",
             easing: "easeInOutCirc",
             type: "jquery"
         },
         defaultTab: $default_tab,
        ready: wsLSTabsReady
    });

  }

  // Render upon page
  $('.ws-ls-chart').each(function () {
    $chart_id = $(this).attr('id');
    ws_ls_render_graph($chart_id);
  });

  function ws_ls_render_graph($chart_id)
  {
      $chart_type = $("#" + $chart_id).data('chart-type');

      // If not specified, default to line
      if(typeof $chart_type === 'undefined'){
          $chart_type = 'line';
      }

      var ctx = $("#" + $chart_id).get(0).getContext("2d");

      var width = $("#" + $chart_id).parent().width();
      $("#" + $chart_id).attr("width",width-50);

      if ('line' == $chart_type) {
          new Chart(ctx, {type: 'line', data: this[$chart_id + "_data"], options: this[$chart_id + "_options"]});
      }
      else if ('bar' == $chart_type) {

		  new Chart(ctx, {type: 'bar', data: this[$chart_id + "_data"], options: this[$chart_id + "_options"]});

	  }
  }

  $('.we-ls-datepicker').each(function() {
    var options = {
                    changeMonth: true,
                    changeYear: true,
                    showButtonPanel: true,
                    dateFormat: ws_ls_config['date-format'],
					showButtonPanel: true,
				    closeText: ws_ls_config['date-picker-locale']['closeText'],
				    currentText: ws_ls_config['date-picker-locale']['currentText'],
				    monthNames: ws_ls_config['date-picker-locale']['monthNames'],
				    monthNamesShort: ws_ls_config['date-picker-locale']['monthNamesShort'],
				    dayNames: ws_ls_config['date-picker-locale']['dayNames'],
				    dayNamesShort: ws_ls_config['date-picker-locale']['dayNamesShort'],
				    dayNamesMin: ws_ls_config['date-picker-locale']['dayNamesMin'],
				    firstDay: ws_ls_config['date-picker-locale']['firstDay']
				};

    $(this).datepicker(options);
  });

  // Form Validation
  $('.we-ls-weight-form-validate').each(function () {

    $form_id = $(this).attr('id');
    $target_form = $(this).data('is-target-form');
    $weight_unit = $(this).data('metric-unit');

    console.log('Adding form validation to: ' + $form_id + '. Target form? ' + $target_form + '. Weight Unit: ' + $weight_unit);

    // Add form validation
    $( "#" + $form_id ).validate({
      errorContainer: "#" + $form_id + " .ws-ls-error-summary",
      errorLabelContainer: "#" + $form_id + " .ws-ls-error-summary ul",
      wrapper: "li",
      errorClass: "ws-ls-invalid",
      validClass: "ws-ls-valid",
      messages: {
          'we-ls-date': ws_ls_config['validation-we-ls-date'],
          'we-ls-weight-pounds': ws_ls_config['validation-we-ls-weight-pounds'],
          'we-ls-weight-kg': ws_ls_config['validation-we-ls-weight-kg'],
          'we-ls-weight-stones': ws_ls_config['validation-we-ls-weight-stones'],
          'we-ls-measurements': ws_ls_config['validation-we-ls-measurements']
      },
      submitHandler: function(form) {
          form.submit();
      }
    });

    // Non Target form specific fields
    if (!$target_form) {
      //If a datepicker is on this form
      if ($("#" + $form_id + " .we-ls-datepicker").length) {
        // Validate date
        if ('true' == ws_ls_config['us-date']) {
          $( "#" + $form_id + " .we-ls-datepicker" ).rules( "add", {
            required: true,
            date: true
          });
        }
        else {
          $( "#" + $form_id + " .we-ls-datepicker" ).rules( "add", {
            required: true,
            dateITA: true
          });
        }
      }

    }

    // Measurement form
    if ('true' == ws_ls_config['measurements-enabled'] && true == $("#" + $form_id).data('measurements-enabled')) {
      $( "#" + $form_id + " .ws-ls-measurement").rules( "add", {
        number: true,
        range: [1, 1000],
        messages: {
          number: ws_ls_config['validation-we-ls-measurements'],
          range: ws_ls_config['validation-we-ls-measurements']
        }
      });
    }

    // Set up numeric fields to validate
    if('imperial-pounds' == $weight_unit)
    {
        $( "#" + $form_id + " #we-ls-weight-pounds").rules( "add", {
          required: true,
          number: true,
          range: [0, 5000]
        });
    }
    if('imperial-both' == $weight_unit)
    {
        $( "#" + $form_id + " #we-ls-weight-stones").rules( "add", {
          required: true,
          number: true,
          range: [0, 5000] // Stupid high in case not tracking human weight!
        });
        $( "#" + $form_id + " #we-ls-weight-pounds").rules( "add", {
          required: true,
          number: true,
          range: [0, 14]
        });
    }
    if('metric' == $weight_unit)
    {
        $( "#" + $form_id + " #we-ls-weight-kg").rules( "add", {
          required: true,
          number: true,
          range: [0, 50000] // Stupid high in case not tracking human weight!
        });
    }
  });

  // User preference form
  if ('true' == ws_ls_config['is-pro']) {

    $( ".ws-ls-user-delete-all" ).validate({
      errorClass: "ws-ls-invalid",
      validClass: "ws-ls-valid",
      //focusCleanup: true,
      errorContainer: ".ws-ls-user-delete-all .ws-ls-error-summary",
      errorLabelContainer: ".ws-ls-user-delete-all .ws-ls-error-summary ul",
      wrapper: "li",
      messages: {
            'ws-ls-delete-all': ws_ls_config['validation-we-ls-history'],
      },
      submitHandler: function(form) {
          form.submit();
      }
    });


    $( ".ws-ls-user-pref-form" ).submit(function( event ) {

        event.preventDefault();

        $post_data = {};

        $('.ws-ls-user-pref-form select').each(function () {
          $post_data[$(this).attr('id')] = $(this).val();
        });

        $post_data['action'] = 'ws_ls_save_preferences';
        $post_data['security'] = ws_ls_config['ajax-security-nonce'];
        $post_data['user-id'] = ws_ls_config['user-id'];

        ws_ls_post_data($post_data, ws_ls_user_preference_callback);
    });


  }


  $('.ws-ls-reload-page-if-clicked').click(function( event ) {
      event.preventDefault();
      window.location.replace(ws_ls_config['current-url']);
  });
});

function ws_ls_post_data(data, callback)
{
  var ajaxurl = ws_ls_config['ajax-url'];

  jQuery.post(ajaxurl, data, function(response) {

    var response = JSON.parse(response);
    callback(data, response);
  });
}

function ws_ls_user_preference_callback(data, response)
{
  if (response == 1) {
    window.location.replace(ws_ls_config['current-url'] + '?user-preference-saved=true');
  }
  else
  {
    console.log('Error saving the user preferences');
  }
}

function ws_ls_get_querystring_value(name)
{
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++)
    {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == name) {
            return sParameterName[1];
        }
    }
}
