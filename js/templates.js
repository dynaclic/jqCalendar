jqcal.templates = {
	plugin: 
		'<div id="jqcal_header">'+
			'<span>'+
				'<button id="jqcal_prev_button">&larr;</button>'+
				'<button id="jqcal_next_button">&rarr;</button>'+
				'<button id="jqcal_today_button">Today</button>'+
			'</span><span id="jqcal_planning_format">'+
				'<input type="radio" id="jqcal_toDay" name="jqcal_planning_format" value="day" /><label for="jqcal_toDay">Day</label>'+
				'<input type="radio" id="jqcal_toCustom" name="jqcal_planning_format" value="custom" /><label for="jqcal_toCustom">Custom</label>'+
				'<input type="radio" id="jqcal_toWeek" name="jqcal_planning_format" value="week" /><label for="jqcal_toWeek">Week</label>'+
			'</span><span">'+
				'Days: <select id="jqcal_nb_days_select">'+
				'{{#select}}<option value={{value}}>{{value}}</option>{{/select}}'+
				'</select>'+
			'</span>'+
		'</div>'+
		'<div id="jqcal_menu_button" style="position: absolute; top:{{top_button}}px; left: {{left_button}}px; width: 20px; height: 20px; cursor: e-resize; background-color: black; border-color: red; border-radius: 3px; border-style: groove;"></div>'+
		'<div id="jqcal_menu" style="float:left; margin-top: 10px; width:200px;">'+
			'Pick a date:<br /><br />'+
			'<div id="jqcal_datepicker"></div><br /><hr />'+
			'<br />Agendas:<button id="jqcal_agendas_new_button" style="float:right;margin-right:10px">New</button><br /><br />'+
		'</div>'+
		'<div id="jqcal_calendar" style="margin-top: 10px; margin-left: {{left_calendar}}px;"></div>'+
		'<div id="jqcal_event_create"></div>'+
		'<div id="jqcal_event_read"></div>'+
		'<div id="jqcal_event_edit"></div>'+
		'<div id="jqcal_event_delete"></div>'+
		'<div id="jqcal_agenda_create"></div>'+
		'<div id="jqcal_agenda_read"></div>'+
		'<div id="jqcal_agenda_edit"></div>'+
		'<div id="jqcal_recurrency"></div>'
	,
	planning:
		'<table id="jqcal_days" column_width={{width}} style = "width: {{total_width}}px; margin-left: {{hours_width}}px;">'+
			'<tbody>'+
				'<tr></tr>'+
			'</tbody>'+
		'</table>'+
		'<br />'+
		'<div id="jqcal_div_fulltimeslots">'+
			'<table id="jqcal_fulltimeslots" column_width={{width}} style = "width: {{total_width}}px; margin-left: {{hours_width}}px;">'+
				'<tbody>'+
					'<tr></tr>'+
				'</tbody>'+
			'</table>'+
		'</div>'+
		'<br />'+
		'<div id="jqcal_calendar_events" style="overflow-y: auto; height: 500px; position: relative;">'+
			'<table id="jqcal_hours" hours_width="{{hours_width}}" style = "float: left; position: relative; width: {{hours_width}}px;">'+
				'<tbody>'+
					'{{#hours}}<tr id="{{id}}"><td style="{{fix_ie7}};">{{hour}}</td></tr>{{/hours}}'+
				'</tbody>'+
			'</table>'+
			'<table id="jqcal_timeslots" column_width={{width}} style = "width: {{total_width}}px; margin-left: {{hours_width}}px;">'+
				'<tbody>'+
					'{{#rows}}<tr id="{{id}}"></tr>{{/rows}}'+
				'</tbody>'+
			'</table>'+
		'</div>'
	,
	day: 
		'{{title}}'
	,
	fullTimeSlot: 
		''
	,
	timeSlot: 
		''
	,
	agenda: 
		'&nbsp;<div style="display: inline-block; border: 1px solid black; width:15px; height:15px; margin-top: 4px; background-color:{{color}}; "></div>'+
		'<span> {{label}}</span>'+
		'<div class="jqcal_agenda_read_button" style="display: inline-block; width:15px; height:15px; margin-top: 4px; float: right; border: 1px solid black; display: none;"></div>'
	,
	event: 
		'{{label}}<br />'+
		'{{starts_at}} - {{ends_at}}'
	,
	full_day_event:
		'{{label}}<br />'
	,
	// CRUD Event
	event_create: 
		'{{starts_at}} - {{ends_at}}<br />'+
		'<input type="text" name="jqcal_event_create_label" /><br />'+
		'<select name="jqcal_event_create_agenda">'+
			'{{#agendas}}'+
			'<option value="{{label}}">{{label}}</option>'+
			'{{/agendas}}'+
		'</select><br />'+
		'<input type="checkbox" name="jqcal_event_create_recurrency" /><br />'+
		'<button id="jqcal_event_create_create">Create</button>'+
		'<button id="jqcal_event_create_cancel">Cancel</button>'+
		'<button id="jqcal_event_create_edit">Edit</button>'
	,
	event_read: 
		'{{starts_at}} - {{ends_at}}<br />'+
		'{{label}}<br />'+
		'{{description}}<br />'+
		'{{agenda}}<br />'+
		'<button id="jqcal_event_read_delete">Delete</button>'+
		'<button id="jqcal_event_read_close">Close</button>'+
		'<button id="jqcal_event_read_edit">Edit</button>'
	,
	event_edit: 
		'<input type="text" value="{{date_start}}" name="jqcal_event_edit_date_start" /> <input type="text" value="{{starts_at}}" name="jqcal_event_edit_starts_at" /><br />'+
		' - '+
		'<input type="text" value="{{date_end}}" name="jqcal_event_edit_date_end" /> <input type="text" value="{{ends_at}}" name="jqcal_event_edit_ends_at" /><br />'+
		'<input type="text" id="jqcal_event_edit_label" value="{{label}}" /><br />'+
		'<textarea name="jqcal_event_edit_description">{{description}}</textarea><br />'+
		'<select name="jqcal_event_edit_agenda">{{#agendas}}<option value={{agenda}}>{{agenda}}</option>{{/agendas}}</select><br />'+
		'<select name="jqcal_event_edit_color">{{#colors}}<option value="{{color}}">#{{color}}</option>{{/colors}}</select><br />'+
		'<input type="checkbox" name="jqcal_event_edit_recurrency" /><br />'+
		'<button id="jqcal_event_edit_save">Save</button>'+
		'<button id="jqcal_event_edit_cancel">Cancel</button>'
	,
	event_delete: 
		'<input type="radio" name="jqcal_event_delete" value="all" checked="checked" /> Delete the main event and all of his occurrences.<br />'+
		'<input type="radio" name="jqcal_event_delete" value="part" /> Delete this event and the future occurrences.<br />'+
		'<input type="radio" name="jqcal_event_delete" value="one" /> Delete only this event.<br />'+
		'<button id="jqcal_event_delete_delete">Delete</button>'+
		'<button id="jqcal_event_delete_cancel">Cancel</button>'
	,
	// CRUD Agenda
	agenda_create: 
		'<input type="text" name="jqcal_agenda_create_label" /><br />'+
		'<textarea name="jqcal_agenda_create_description"></textarea><br />'+
		'<select name="jqcal_agenda_create_color">{{#colors}}<option value="{{color}}">#{{color}}</option>{{/colors}}</select><br />'+
		'<input type="checkbox" name="jqcal_agenda_create_transparency_past" /><br />'+
		'<input type="checkbox" name="jqcal_agenda_create_transparency_recurrency" /><br />'+
		'<button id="jqcal_agenda_create_create">Create</button>'+
		'<button id="jqcal_agenda_create_cancel">Cancel</button>'
	,
	agenda_read: 
		'{{label}}<br />'+
		'{{description}}'+
		'<div class="jqcal_agenda_read_button" style="width:15px; height:15px; border: 1px solid black; background-color:{{color}};"></div>'+
		'Opacity for past events: {{transparency_past}}<br />'+
		'Opacity for occurrences: {{transparency_recurrency}}<br />'+
		'<button id="jqcal_agenda_read_delete">Delete</button>'+
		'<button id="jqcal_agenda_read_close">Close</button>'+
		'<button id="jqcal_agenda_read_edit">Edit</button>'
	,
	agenda_edit: 
		'<input type="text" value="{{label}}" name="jqcal_agenda_edit_label" /><br />'+
		'<textarea name="jqcal_agenda_edit_description">{{description}}</textarea><br />'+
		'<select name="jqcal_agenda_edit_color">{{#colors}}<option value="{{color}}">#{{color}}</option>{{/colors}}</select><br />'+
		'<input type="checkbox" name="jqcal_agenda_edit_transparency_past" /><br />'+
		'<input type="checkbox" name="jqcal_agenda_edit_transparency_recurrency" /><br />'+
		'<button id="jqcal_agenda_edit_save">Save</button>'+
		'<button id="jqcal_agenda_edit_cancel">Cancel</button>'
	,
	// Recurrency
	recurrency: 
		'<label for="jqcal_recurrency_type">Type: </label><select id="jqcal_recurrency_type">'+
			'<option value="daily">Daily</option>'+
			'<option value="weekly">Weekly</option>'+
			'<option value="monthly">Monthly</option>'+
			'<option value="yearly">Yearly</option>'+
		'</select><br />'+
		'<label for="jqcal_recurrency_every">Every: </label><input type="text" id="jqcal_recurrency_every" />'+
		'<div id="jqcal_recurrency_when_weekly"></div>'+
		'<div id="jqcal_recurrency_when_monthly"></div>'+
		'Ends:<br />'+
		'<input type="radio" id="jqcal_recurrency_never" name="jqcal_recurrency_end" value="never" checked="checked" /><label for="jqcal_recurrency_never">Never</label><br />'+
		'<input type="radio" id="jqcal_recurrency_on" name="jqcal_recurrency_end" value="on" /><label for="jqcal_recurrency_on">On: </label><input type="text" id="jqcal_recurrency_on_date" disabled="disabled" /><br />'+
		'<input type="radio" id="jqcal_recurrency_after" name="jqcal_recurrency_end" value="after" /><label for="jqcal_recurrency_after">After: </label><input type="text" id="jqcal_recurrency_after_number" disabled="disabled" /><br />'+
		'<button id="jqcal_recurrency_ok">Ok</button>'+
		'<button id="jqcal_recurrency_cancel">Cancel</button>'
};
