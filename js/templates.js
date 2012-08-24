jqcal.templates = {
	plugin: 
		'<div id="jqcal_header">'+
			'<span>'+
				'<button id="jqcal_prev_button">&larr;</button>'+
				'<button id="jqcal_next_button">&rarr;</button>'+
				'<button id="jqcal_today_button">Today</button>'+
			'</span><span id="jqcal_planning_period">'+
			'</span><span id="jqcal_planning_format">&nbsp;&nbsp;&nbsp;'+
				'<input type="radio" id="jqcal_toDay" name="jqcal_planning_format" value="day" /><label for="jqcal_toDay">&nbsp;Day&nbsp;</label>'+
				'<input type="radio" id="jqcal_toCustomDay" name="jqcal_planning_format" value="custom_day" /><label for="jqcal_toCustomDay">&nbsp;Custom Days&nbsp;</label>'+
				'<input type="radio" id="jqcal_toWeek" name="jqcal_planning_format" value="week" /><label for="jqcal_toWeek">&nbsp;Week&nbsp;</label>'+
				'<input type="radio" id="jqcal_toCustomWeek" name="jqcal_planning_format" value="custom_week" /><label for="jqcal_toCustomWeek">&nbsp;Custom Weeks&nbsp;</label>'+
				'<input type="radio" id="jqcal_toMonth" name="jqcal_planning_format" value="month" /><label for="jqcal_toMonth">&nbsp;Month&nbsp;</label>'+
			'</span><span>'+
				'<label for="jqcal_nb_days_select">Days: </label><select id="jqcal_nb_days_select">'+
				'{{#select_days}}<option value={{value}}>{{value}}</option>{{/select_days}}'+
				'</select>'+
			'</span><span>'+
				'<label for="jqcal_nb_weeks_select">Weeks: </label><select id="jqcal_nb_weeks_select">'+
				'{{#select_weeks}}<option value={{value}}>{{value}}</option>{{/select_weeks}}'+
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
	planning_day:
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
	planning_month:
		'<table id="jqcal_days" column_width={{width}} style = "width: {{total_width}}px;">'+
			'<tbody>'+
				'<tr></tr>'+
			'</tbody>'+
		'</table>'+
		'<br />'+
		'<div id="jqcal_calendar_events" style="overflow-y: auto; height: 500px; position: relative;">'+
			'<table id="jqcal_dayslots" column_width={{width}} style = "width: {{total_width}}px;">'+
				'<tbody>'+
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
	week:
		''
	,
	daySlot:
		'{{day}}'
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
		'<label for="jqcal_event_create_label">Label: </label><input type="text" id="jqcal_event_create_label" name="jqcal_event_create_label" /><br />'+
		'<label for="jqcal_event_create_agenda">Agenda: </label><select id="jqcal_event_create_agenda" name="jqcal_event_create_agenda">'+
			'{{#agendas}}'+
			'<option value="{{label}}">{{label}}</option>'+
			'{{/agendas}}'+
		'</select><br />'+
		'<label for="jqcal_event_create_recurrency">Recurrency: </label><input type="checkbox" id="jqcal_event_create_recurrency" name="jqcal_event_create_recurrency" /><br />'
	,
	event_create_buttons:
		'<button id="jqcal_event_create_create">Create</button>'+
		'<button id="jqcal_event_create_cancel">Cancel</button>'+
		'<button id="jqcal_event_create_edit">Edit</button>'
	,
	event_read: 
		'{{starts_at}} - {{ends_at}}<br />'+
		'Label: {{label}}<br />'+
		'Description: {{description}}<br />'+
		'Agenda: {{agenda}}<br />'
	,
	event_read_buttons:
		'<button id="jqcal_event_read_delete">Delete</button>'+
		'<button id="jqcal_event_read_close">Close</button>'+
		'<button id="jqcal_event_read_edit">Edit</button>'
	,
	event_edit: 
		'<label for="jqcal_event_edit_date_start">Starts_at: </label><input type="text" value="{{date_start}}" id="jqcal_event_edit_date_start" name="jqcal_event_edit_date_start" /> <input type="text" value="{{starts_at}}" name="jqcal_event_edit_starts_at" /><br />'+
		' - '+
		'<label for="jqcal_event_edit_date_end">Ends_at: </label><input type="text" value="{{date_end}}" id="jqcal_event_edit_date_end" name="jqcal_event_edit_date_end" /> <input type="text" value="{{ends_at}}" name="jqcal_event_edit_ends_at" /><br />'+
		'<label for="jqcal_event_edit_label">Label: </label><input type="text" id="jqcal_event_edit_label" name="jqcal_event_edit_label" value="{{label}}" /><br />'+
		'<label for="jqcal_event_edit_description">Description: </label><textarea id="jqcal_event_edit_description" name="jqcal_event_edit_description">{{description}}</textarea><br />'+
		'<label for="jqcal_event_edit_agenda">Agenda: </label><select id="jqcal_event_edit_agenda" name="jqcal_event_edit_agenda">{{#agendas}}<option value={{agenda}}>{{agenda}}</option>{{/agendas}}</select><br />'+
		'<label for="jqcal_event_edit_color">Color: </label><select id="jqcal_event_edit_color" name="jqcal_event_edit_color">{{#colors}}<option value="{{color}}">#{{color}}</option>{{/colors}}</select><br />'+
		'<label for="jqcal_event_edit_recurrency">Recurrency: </label><input type="checkbox" id="jqcal_event_edit_recurrency" name="jqcal_event_edit_recurrency" /><br />'
	,
	event_edit_buttons:
		'<button id="jqcal_event_edit_save">Save</button>'+
		'<button id="jqcal_event_edit_cancel">Cancel</button>'
	,
	event_delete: 
		'<input type="radio" id="jqcal_event_delete_all" name="jqcal_event_delete" value="all" checked="checked" /><label for="jqcal_event_delete_all"> Delete the main event and all of his occurrences.</label><br />'+
		'<input type="radio" id="jqcal_event_delete_part" name="jqcal_event_delete" value="part" /><label for="jqcal_event_delete_part"> Delete this event and the future occurrences.</label><br />'+
		'<input type="radio" id="jqcal_event_delete_one" name="jqcal_event_delete" value="one" /><label for="jqcal_event_delete_one"> Delete only this event.</label><br />'+
		'<button id="jqcal_event_delete_delete">Delete</button>'+
		'<button id="jqcal_event_delete_cancel">Cancel</button>'
	,
	// CRUD Agenda
	agenda_create: 
		'<label for="jqcal_agenda_create_label">Label: </label><input type="text" id="jqcal_agenda_create_label" name="jqcal_agenda_create_label" /><br />'+
		'<label for="jqcal_agenda_create_description">Description: </label><textarea id="jqcal_agenda_create_description" name="jqcal_agenda_create_description"></textarea><br />'+
		'<label for="jqcal_agenda_create_color">Color: </label><select id="jqcal_agenda_create_color" name="jqcal_agenda_create_color">{{#colors}}<option value="{{color}}">#{{color}}</option>{{/colors}}</select><br />'+
		'<label for="jqcal_agenda_create_transparency_past">Transparency for past events: </label><input type="checkbox" id="jqcal_agenda_create_transparency_past" name="jqcal_agenda_create_transparency_past" /><br />'+
		'<label for="jqcal_agenda_create_transparency_recurrency">Transparency for occurrences: </label><input type="checkbox" id="jqcal_agenda_create_transparency_recurrency" name="jqcal_agenda_create_transparency_recurrency" /><br />'
	,
	agenda_create_buttons:
		'<button id="jqcal_agenda_create_create">Create</button>'+
		'<button id="jqcal_agenda_create_cancel">Cancel</button>'
	,
	agenda_read: 
		'Label: {{label}}<br />'+
		'Description: {{description}}<br />'+
		'Color: <div class="jqcal_agenda_read_button" style="width:15px; height:15px; border: 1px solid black; background-color:{{color}}; display: inline-block;"></div><br />'+
		'Opacity for past events: {{transparency_past}}<br />'+
		'Opacity for occurrences: {{transparency_recurrency}}<br />'
	,
	agenda_read_buttons:
		'<button id="jqcal_agenda_read_delete">Delete</button>'+
		'<button id="jqcal_agenda_read_close">Close</button>'+
		'<button id="jqcal_agenda_read_edit">Edit</button>'
	,
	agenda_edit: 
		'<label for="jqcal_agenda_edit_label">Label: </label><input type="text" value="{{label}}" id="jqcal_agenda_edit_label" name="jqcal_agenda_edit_label" /><br />'+
		'<label for="jqcal_agenda_edit_description">Description: </label><textarea id="jqcal_agenda_edit_description" name="jqcal_agenda_edit_description">{{description}}</textarea><br />'+
		'<label for="jqcal_agenda_edit_color">Color: </label><select id="jqcal_agenda_edit_color" name="jqcal_agenda_edit_color">{{#colors}}<option value="{{color}}">#{{color}}</option>{{/colors}}</select><br />'+
		'<label for="jqcal_agenda_edit_transparency_past">Transparency for past events: </label><input type="checkbox" id="jqcal_agenda_edit_transparency_past" name="jqcal_agenda_edit_transparency_past" /><br />'+
		'<label for="jqcal_agenda_edit_transparency_recurrency">Transparency for occurrences: </label><input type="checkbox" id="jqcal_agenda_edit_transparency_recurrency" name="jqcal_agenda_edit_transparency_recurrency" /><br />'
	,
	agenda_edit_buttons:
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
