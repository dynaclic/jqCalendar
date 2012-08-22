PluginView = Backbone.View.extend({
	initialize: function() {
		// add the jqcal class to the main element
		this.$el.attr('class', this.$el.attr('class') ? this.$el.attr('class')+' jqcal' : 'jqcal');
		this.render();
	},
	render: function() {
		// instantiate the template
		var top_button = $(window).height()/1.5;
		var left_calendar = 220;
		var left_button = 200;
		
		var template = jqcal.templates.plugin({
			select: [
				{value: 2},
				{value: 3},
				{value: 4},
				{value: 5},
				{value: 6}
			],
			left_calendar: left_calendar,
			left_button: left_button,
			top_button: top_button
		});
		
		// display the view
		this.$el.html(template);
		
		//toggle
		$('#jqcal_menu_button').click(function() {
			if($('#jqcal_menu').is(':visible')){
				$('#jqcal_menu').hide();
				$(this).offset({left: 10});
				$('#jqcal_calendar').css('marginLeft', 30);
			}
			else{
				$('#jqcal_menu').show();
				$(this).offset({left: left_button});
				$('#jqcal_calendar').css('marginLeft', left_calendar);
			}
			$('.jqcal').data('planning').get('view').render();
		});
		
		// add the datepicker
		$('#jqcal_datepicker').datepicker({
			dateFormat: 'yy/mm/dd',
			firstDay: 1,
			showWeek: true,
			changeMonth: true,
			changeYear: true,
			onSelect: function(date) {
				// get the plugin & the planning
				var plugin = $('.jqcal').data('plugin');
				var planning = $('.jqcal').data('planning');
				
				// set the planning's starts_at
				switch(planning.get('format')) {
					case 'day':
					case 'custom':
						var starts_at = (new Date(date)).getTime() - getLocalTimezoneOffset() * 60000 + plugin.get('timezone_offset') * 60000;
						break;
					case 'week':
						var starts_at = getWeek((new Date(date)).getTime() - getLocalTimezoneOffset() * 60000 + plugin.get('timezone_offset') * 60000, plugin);
						break;
				}
				$('.jqcal').data('planning').set('starts_at', starts_at);
			}
		});
		
		// apply the permissions
		if(_.indexOf(this.model.get('no_perm_agenda'), 'create') != -1) {
			$('#jqcal_agendas_new_button').remove();
		}
	},
	events: {
		'change #jqcal_nb_days_select': 'updateNbDays',
		'click #jqcal_prev_button': 'prev',
		'click #jqcal_next_button': 'next',
		'click #jqcal_today_button': 'today',
		'change #jqcal_planning_format': 'changePlanningFormat',
		'click #jqcal_agendas_new_button': 'agendaMenu'
	},
	updateNbDays: function() {
		$('.jqcal').data('planning').set('nb_days', $('#jqcal_nb_days_select').val());
	},
	prev: function(e) {
		e.preventDefault();
		this.addDays(-1)
	},
	next: function(e) {
		e.preventDefault();
		this.addDays(1);
	},
	addDays: function(sign) {
		var planning = $('.jqcal').data('planning');
		switch(planning.get('format')) {
			case 'day':
				planning.set('starts_at', jqcal.time.addDays(planning.get('starts_at'), sign));
				break;
			case 'custom':
				planning.set('starts_at', jqcal.time.addDays(planning.get('starts_at'), sign*planning.get('nb_days')));
				break;
			case 'week':
				planning.set('starts_at', jqcal.time.addDays(planning.get('starts_at'), sign*7));
				break;
		}
	},
	today: function(e) {
		var plugin = $('.jqcal').data('plugin');
		var planning = $('.jqcal').data('planning');
		switch(planning.get('format')) {
			case 'day':
			case 'custom':
				planning.set('starts_at', jqcal.time.getToday(plugin.get('timezone_offset')));
				break;
			case 'week':
				planning.set('starts_at', jqcal.time.getWeek(jqcal.time.getToday(plugin.get('timezone_offset')), plugin));
				break;
		}
	},
	changePlanningFormat: function() {
		var plugin = $('.jqcal').data('plugin');
		var planning = $('.jqcal').data('planning');
		var new_format = $('[name = jqcal_planning_format]:checked').val();
		planning.set('format', new_format);
		if(new_format == 'week') {
			planning.set('starts_at', jqcal.time.getWeek(planning.get('starts_at'), plugin));
		}
	},
	agendaMenu: function() {
		new AgendaCreateView({
			el: $('#jqcal_agenda_create')
		});
	}
});

PlanningView = Backbone.View.extend({
	initialize: function() {
		// bind the model's onChange event to this.render
		this.render = _.bind(this.render, this); 
		this.model.bind('change:nb_days change:format change:starts_at', this.render);
		
		this.model.set('view', this);
		
		this.render();
	},
	render: function() {
		// get the plugin
		var plugin = $('.jqcal').data('plugin');
		
		//prevent selection
		$('.jqcal').disableSelection();
		
		// remove dialogs
		plugin.removeDialogs();
		
		// set the select days correctly
		$('#jqcal_nb_days_select').val(this.model.get('nb_days'));
		
		//-----affichage------- 
		var nb_days_displayed = 7;
		switch(this.model.get('format')) {
			case 'day': nb_days_displayed = 1;
				break;
			case 'custom': nb_days_displayed = this.model.get('nb_days');
				break;
			case 'week': nb_days_displayed = 7 - plugin.get('hidden_days').length;
				break;
			default: nb_days_displayed = 7;
		}
		
		
		//define #jqcal_hours width (the width of the displayed hours)
		var hours_width = 50;

		//find the best fitting size for the calendar
		var calendar_size = Math.floor($('#jqcal_calendar').width()*96/100 - hours_width);
		var column_width = Math.floor(calendar_size/nb_days_displayed);
		var total_width = nb_days_displayed*column_width + 1;
		
		//-------------
		
		
		// set the format
		var format = this.model.get('format');
		format = format.substr(0,1).toUpperCase() + format.substr(1);
		$('#jqcal_to'+format).attr('checked', 'checked');
	
		// show/hide the select menu
		if(format == 'Custom') {
			$('#jqcal_nb_days_select').parent().show();
		}
		else {
			$('#jqcal_nb_days_select').parent().hide();
		}
	
		// instantiate the template
		var object = {rows: [], hours: [], width: column_width, total_width: (total_width), hours_width: hours_width, fix_ie7: []};
		for(var i = 0; i < (plugin.get('day_ends_at') - plugin.get('day_starts_at')) * (1/plugin.get('day_fraction')); i++) {
			object.rows.push({id: 'jqcal_row_'+i});
			var hour = jqcal.time.addHours(this.model.get('starts_at'),(i*plugin.get('day_fraction') + plugin.get('day_starts_at')));
			
			// fix for ie7
			if($.browser.msie && document.documentMode == '7') {
				if(i == 0){
					object.hours.push({id: 'jqcal_hour_'+i, hour: jqcal.time.timestampToTime(hour, plugin.get('timezone_offset')), fix_ie7: 'height:50px;'});
				}
				else{
					object.hours.push({id: 'jqcal_hour_'+i, hour: jqcal.time.timestampToTime(hour, plugin.get('timezone_offset')), fix_ie7: 'height:49px;'});
				}
			}
			else{
				object.hours.push({id: 'jqcal_hour_'+i, hour: jqcal.time.timestampToTime(hour, plugin.get('timezone_offset')), fix_ie7: ''});
			}
		}
		var template = jqcal.templates.planning(object);
		
		// display the view
		this.$el.html(template);
		
		// instantiate the day views
		_.each(this.model.get('days').models, function(day) {
			var day_view = new DayView({
				model: day
			});
		});
		
		// display the events
		_.each($('.jqcal').data('agendas').models, function(agenda) {
			_.each(agenda.get('events').models, function(event) {
				event.removeView();
				event.get('view').render();
				event.bindTimeslots();
			});
				
		});
		
		this.parse_full_day();
		
		// update events for each day
		this.parse_each_day();
			
		// adjust the datepicker
		$('#jqcal_datepicker').datepicker('setDate', new Date(this.model.get('starts_at')));
	},
	parse_full_day: function() { // browse each day to determine the position of the events inside (for full day events)
		var all_events = [];
		var max = 0;
		//z index = 0
		_.each(this.model.get('days').models, function(day) {
			events = day.get('fullTimeSlot').get('events').models;
			all_events = _.union(all_events, events);
			max = events.length > max ? events.length : max;
			for(var e in events){
				events[e].get('view').$el.css('zIndex', 0);
			}
		});
		
		// determine z_index range
		var total_z_index = [];
		for(var i = 1; i <= max; i++){
			total_z_index.push(i);
		}
		
		//determine z_index of each event
		_.each(this.model.get('days').models, function(day){
			events = day.get('fullTimeSlot').get('events').models;
		
			var new_events = _.filter(events, function(event){
				return event.get('view').$el.css('zIndex') == 'auto' || event.get('view').$el.css('zIndex') == '0' || event.get('view').$el.css('zIndex') == 0;
			});
			if(new_events.length != 0){
				new_events.sort(function(event1, event2) {
					if(event1.get('starts_at') < event2.get('starts_at')){
						return -1;
					}
					else if(event1.get('starts_at') == event2.get('starts_at')){
						if(event1.get('ends_at') >= event2.get('ends_at')){
							return -1;
						}
						else{
							return 1;
						}	
					}
					else{
						return 1;
					}
				});
				var old_events_z_index = [];
				old_events = _.difference(events, new_events);
				for(var e in old_events){
					old_events_z_index.push(~~(old_events[e].get('view').$el.css('zIndex')));
				}
				var z_index_dispo = _.difference(total_z_index, old_events_z_index);

				for(var e in new_events){
					var z = z_index_dispo[e];
					if(z){
						new_events[e].get('view').$el.css('zIndex', z);
					}
					else {
						new_events[e].get('view').$el.css('zIndex', max);
					}
				}
			}
		});

		//initial values (based on #jqcal_days)
		$('#jqcal_fulltimeslots').height($('#jqcal_days').height());
		var pos_top_init = $('#jqcal_fulltimeslots').offset().top;
		var height_init = $('#jqcal_fulltimeslots').outerHeight() - 10;
		
		//height
		$('#jqcal_fulltimeslots').height(max * height_init + 20);
		
		//place the events according to their z_index
		for(var e in all_events){
			zIndex = ~~(all_events[e].get('view').$el.css('zIndex'));
			all_events[e].get('view').$el.offset({top: pos_top_init + (zIndex - 1) * height_init});
			all_events[e].get('view').$el.height((max - zIndex + 1) * height_init);
		}
	},
	parse_each_day: function() {
		var self = this;
		_.each(this.model.get('days').models, function(day) {
			self.parse_day(day);
		});
	},
	parse_days: function(days) {
		var self = this;
		_.each(days, function(day) {
			self.parse_day(day);
		});
	},
	/*
	 * browse a day in order to get the timeslots where we need to render events
	 */
	parse_day: function(day){
		var start_timeslot = null;
		var timeslots = day.get('timeSlots').models;
		var timeslots_tab = [];
		var j = 0;
		for(var timeslot = 0; timeslot < timeslots.length; timeslot++){
			if(timeslots[timeslot].get('events').models.length >= 1){
				if(start_timeslot == null) {
					var timeslots_tab = [];
					start_timeslot = timeslots[timeslot];
					var i = 0;
					var max = 0;
					while(timeslots[~~(timeslot) + i] && timeslots[~~(timeslot) + i].get('events').models.length > 0){	
						max = max > timeslots[~~(timeslot) + i].get('events').models.length ? max : timeslots[~~(timeslot) + i].get('events').models.length;
						timeslots_tab.push(timeslots[~~(timeslot) + i]);
						i++;
					}
					if(!timeslots[~~(timeslot) + i]){
						if(timeslots_tab[0]){
							this.render_multi_events(timeslots_tab, max);
						}
						break;
					}
					else {
						timeslot = ~~(timeslot) + i;
						if(timeslots_tab[0]){
							this.render_multi_events(timeslots_tab, max);
						}
						start_timeslot = null;
					}
				}
			}
		}
	},
	/*
	 * determine the right place for each events when they are on the same timeslot
	 */
	render_multi_events: function(timeslots, max){
		// get the z_index range
		var total_z_index = [];
		for(var i = 1; i <= max; i++){
			total_z_index.push(i);
		}
		
		//initial values
		var previous_offset = 0;
		var all_events = [];
		var width = timeslots[0].get('view').$el.width() - 10;
		var o = timeslots[0].get('view').$el.offset().left;
		
		// initialize the timeslots
		for(var timeslot in timeslots){
			var events = timeslots[timeslot].get('events').models;
			for(var e in events){
				events[e].get('view').$el.css('zIndex', '0');
				events[e].get('view').$el.width(width);
				events[e].get('view').$el.offset({left: 0});
			}
		}
		
		// find the z_index for each event
		for(var timeslot in timeslots){
			var events = timeslots[timeslot].get('events').models;
			
			// sort events
			events.sort(function(event1, event2) {
					if(event1.get('starts_at') < event2.get('starts_at')){
						return -1;
					}
					else if(event1.get('starts_at') == event2.get('starts_at')){
						if(event1.get('ends_at') >= event2.get('ends_at')){
							return -1;
						}
						else{
							return 1;
						}
					}
					else{
						return 1;
					}
				});

			//first event(s)
			if(events.length > previous_offset && previous_offset == 0){
					if(events.length == 1){
						events[0].get('view').$el.css('zIndex', '1');
					}
					else {
						for(var e in events){
							events[e].get('view').$el.css('zIndex', ~~(e)+1);
						}
					}
				previous_offset = events.length;
			}
			else {
				// new events don't have a z index
				var new_events = _.filter(events, function(event){
					return event.get('view').$el.css('zIndex') == 'auto' || event.get('view').$el.css('zIndex') == '0' || event.get('view').$el.css('zIndex') == 0;
				});
				if(new_events.length != 0){
					new_events.sort(function(event1, event2) {
						if(event1.get('starts_at') < event2.get('starts_at')){
							return -1;
						}
						else if(event1.get('starts_at') == event2.get('starts_at')){
							if(event1.get('ends_at') >= event2.get('ends_at')){
								return -1;
							}
							else{
								return 1;
							}	
						}
						else{
							return 1;
						}
					});
					var old_events_z_index = [];
					old_events = _.difference(events, new_events);
					for(var e in old_events){
						old_events_z_index.push(~~(old_events[e].get('view').$el.css('zIndex')));
					}
					var z_index_dispo = _.difference(total_z_index, old_events_z_index);
					for(var e in new_events){
						var z = z_index_dispo[e];
						if(z){
							new_events[e].get('view').$el.css('zIndex', z);
						}
						else {
							new_events[e].get('view').$el.css('zIndex', max);
						}
					}
				}
			}
		}
		
		
		// place the events according to their z_index
		for(var timeslot in timeslots){
			var events = timeslots[timeslot].get('events').models;
			var events_z_index = [];
			for(var e in events){
				events_z_index.push(~~(events[e].get('view').$el.css('zIndex')));
			}
			var z_index_dispo = _.difference(total_z_index, events_z_index);
			_.each(events, function(e) {
				z_index = e.get('view').$el.css('zIndex');
				if(z_index == 1){
					var offset = o;
					e.get('view').$el.offset({left : offset});
					var new_width = width*1.7/((max - z_index_dispo.length) == 0 ? 1.7 : (max - z_index_dispo.length));
					if(new_width < e.get('view').$el.width()){
						e.get('view').$el.width(new_width);
					}
				}
				else if(z_index == max){
					var offset = o + ((max - 1)/max)*width;
					if(offset > e.get('view').$el.offset().left) {
						e.get('view').$el.offset({left : offset});
					}
						
					var new_width = width*1/max;
					if(new_width < e.get('view').$el.width()){
						e.get('view').$el.width(new_width);
					}
				}
				else{
					if(z_index_dispo.length == 0){
						var new_width = width*1.7/((max - z_index_dispo.length) == 0 ? 1.7 : (max - z_index_dispo.length));
						if(new_width < e.get('view').$el.width()){
							e.get('view').$el.width(new_width);
						}
						
						var offset = o + (~~(z_index)-1)/max*width;
						if(offset > e.get('view').$el.offset().left)
							e.get('view').$el.offset({left : offset});
					}
					else {
						if(z_index == (max - z_index_dispo.length)){
							var new_width = width*(1 - (~~(z_index)-1)/max);
							if(new_width < e.get('view').$el.width()){
								e.get('view').$el.width(new_width);
							}
						}
						else{
							var new_width = width*1.7/((max - z_index_dispo.length) == 0 ? 1.7 : (max - z_index_dispo.length));
							if(new_width < e.get('view').$el.width()){
								e.get('view').$el.width(new_width);
							}
						}
						
						var offset = o + (~~(z_index)-1)/max*width;
						if(offset > e.get('view').$el.offset().left)
							e.get('view').$el.offset({left : offset});
					}
				}
			});
		}
	}
});

DayView = Backbone.View.extend({
	tagName: 'td',
	initialize: function(){
		this.render();
	},
	render: function(){
		// get the plugin
		var plugin = $('.jqcal').data('plugin');
	
		// instantiate the template
		var template = jqcal.templates.day({
			title: jqcal.time.timestampToFormat(this.model.get('date'), plugin.get('timezone_offset'), plugin.get('date_format'))
		});
		
		// display the view
		this.$el.append(template);
		$('#jqcal_days tr').append(this.$el);
		
		// instantiate the fullTimeSlot view
		var view = new FullTimeSlotView({
			model: this.model.get('fullTimeSlot')
		});
		this.model.get('fullTimeSlot').set('view', view);
		
		// instantiate the timeSlot views
		_.each(this.model.get('timeSlots').models, function(timeSlot) {
			var view = new TimeSlotView({
				model: timeSlot
			});
			timeSlot.set('view', view);
		});
	}
});

FullTimeSlotView = Backbone.View.extend({
	tagName: 'td',
	initialize: function() {
		this.$el.attr({
			starts_at: this.model.get('starts_at'),
			ends_at: this.model.get('ends_at')
		}).css('cursor' , 'default');
		this.render();
	},
	render: function() {
		// instantiate the template
		var template = jqcal.templates.fullTimeSlot({});
		
		// display the view
		this.$el.append(template);
		$('#jqcal_fulltimeslots tbody tr').append(this.$el);
	},
	events: {
		'mousedown': 'createEvent'
	},
	createEvent: function() {
		if(_.indexOf($('.jqcal').data('plugin').get('no_perm_event'), 'create') == -1) {
			var full_day_event = new Event({
				starts_at: this.model.get('starts_at'),
				ends_at: this.model.get('ends_at'),
				fullDay: true
			});
			
			var full_day_event_view = new EventView({
				model: full_day_event
			});
			
			// call EventView's method creation_fd
			full_day_event_view.creation_fd();
		}
	}
});

TimeSlotView = Backbone.View.extend({
	tagName: 'td',
	initialize: function() {
		this.$el.attr({
			starts_at: this.model.get('starts_at'),
			ends_at: this.model.get('ends_at')
		}).css('cursor' , 'default');
		this.render();
	},
	render: function() {
		// get the plugin
		var plugin = $('.jqcal').data('plugin');
	
		// instantiate the template
		var template = jqcal.templates.timeSlot({
			starts_at: jqcal.time.timestampToTime(this.model.get('starts_at'), plugin.get('timezone_offset')),
			ends_at: jqcal.time.timestampToTime(this.model.get('ends_at'), plugin.get('timezone_offset'))
		});
		
		// display the view
		this.$el.append(template);
		var id = Math.floor((this.model.get('starts_at') - jqcal.time.addHours(jqcal.time.getDay(this.model.get('starts_at'), plugin.get('timezone_offset')), plugin.get('day_starts_at'))) / (plugin.get('day_fraction') * 60 * 60 * 1000));
		$('#jqcal_row_'+id).append(this.$el);
	},
	events: {
		// on click: create an Event
		'mousedown': 'createEvent'
	},
	createEvent: function() {
		if(_.indexOf($('.jqcal').data('plugin').get('no_perm_event'), 'create') == -1) {
			// instantiate the event
			var event = new Event({
				starts_at: this.model.get('starts_at'),
				ends_at: this.model.get('ends_at')
			});
			
			// instantiate the view
			var event_view = new EventView({
				model: event
			});
			event_view.creation();
		}
	}
});

AgendaView = Backbone.View.extend({
	tagName: 'div',
	initialize: function() {
		// bind the model's onChange event
		var self = this;
		this.model.bind('change', function() {
			var diff = self.model.changedAttributes();
			if(_.has(diff, 'label')) {
				self.setLabel();
			}
			if(_.has(diff, 'color')) {
				self.setColor();
			}
			_.each(jqcal.agenda, function(attribute) {
				if(_.indexOf(attribute.elements, 'view') != -1 && _.has(diff, attribute.name)) {
					self.setTemplate();
				}
			});
		});
	
		this.$el.css({
			marginLeft: '10px',
			marginRight: '10px',
			cursor: 'pointer'
		});
		
		this.model.set('view', this);
		
		this.render()
	},
	render: function() {
		// instantiate the template
		this.setTemplate();
		$('#jqcal_menu').append(this.$el);
	},
	events: {
		'mouseenter': 'highlightOn',
		'mouseleave': 'highlightOff',
		'click': 'action'
	},
	highlightOn: function() {
		this.$el.css('backgroundColor', '#eeeeee');
		this.$el.children(':last').show();
	},
	highlightOff: function() {
		this.$el.css('backgroundColor', '');
		this.$el.children(':last').hide();
	},
	action: function(e) {
		var originalTarget = e.srcElement || e.originalEvent.explicitOriginalTarget;
		if($(originalTarget).hasClass('jqcal_agenda_read_button')) {
			this.read();
		}
		else {
			this.toggleDisplay();
		}
	},
	toggleDisplay: function() {
		$('.jqcal').data('plugin').removeDialogs();
		if(this.model.get('display')) {
			this.$el.children(':first-child').css('backgroundColor', '');
			_.each(this.model.get('events').models, function(event) {
			/*	event.unbindTimeslots();
				event.unset('timeSlot_view');*/
				event.removeView();
				event.get('view').remove();
				$('.' + event.cid).remove();
			});
		}
		else {
			this.$el.children(':first-child').css('backgroundColor', this.model.get('color'));
			_.each(this.model.get('events').models, function(event) {
				event.get('view').render();
				event.bindTimeslots();
			});
		}
		$('.jqcal').data('planning').get('view').parse_each_day();
		this.model.set('display', !this.model.get('display'));
	},
	read: function() {
		if(_.indexOf($('.jqcal').data('plugin').get('no_perm_event'), 'read') == -1) {
			new AgendaReadView({
				model: this.model,
				el: $('#jqcal_agenda_read')
			});
		}
	},
	setLabel: function() {
		this.$el.children('span').html(' '+this.model.get('label'));
	},
	setColor: function() {
		this.$el.children(':first-child').css('backgroundColor', this.model.get('color'));
	},
	setTemplate: function(){
		var object = {
			color: this.model.get('color'),
			label: this.model.get('label')			
		};
		var self = this;
		_.each(jqcal.agenda, function(attribute) {
			if(_.indexOf(attribute.elements, 'view')) {
				if(self.model.get(attribute.name) != undefined) {
					object[attribute.name] = self.model.get(attribute.name).toString();
				}
			}
		});
		var template = jqcal.templates.agenda(object);
		this.$el.html(template);
	}
});

EventView = Backbone.View.extend({
	initialize: function() {
		// bind the model's onChange event
		var self = this;
		this.model.bind('change', function() {
			var diff = self.model.changedAttributes();
			if(_.has(diff, 'starts_at') || _.has(diff, 'ends_at')) {
				self.render();
			}
			else if(_.has(diff, 'label')) {
				self.setTemplate();
			}
			if(_.has(diff, 'color')) {
				self.setColor();
			}
			if(_.has(diff, 'agenda') || _.has(diff, 'ends_at')){
				self.setOpacity();
			}
			_.each(jqcal.event, function(attribute) {
				if(_.indexOf(attribute.elements, 'view') != -1 && _.has(diff, attribute.name)) {
					self.setTemplate();
				}
			});
		});
		
		this.setOpacity = _.bind(this.setOpacity, this);
		if(this.model.get('agenda')){
			$('.jqcal').data('agendas').where({label: this.model.get('agenda')})[0].bind('change:transparency_past change:transparency_recurrency', this.setOpacity);
		}
		
		this.model.set('view', this);
		this.$el.html('<div></div>').css({
										position: 'absolute',
										cursor: 'pointer'
										});
		this.render(this.getScroll());
		this.setColor();
		this.setOpacity();
	},
	render: function(scroll){
	
		// destroy and unbind (from a timeslot) extended events
		$('.' + this.model.cid).remove();
		var extended = this.model.get('children').models;
		for(var e in extended){
			extended[e].unbindTimeslots();
			extended[e].remove();
		}
		
		// rebind the events
		this.delegateEvents();
	
		// get the plugin and the planning
		var plugin = $('.jqcal').data('plugin');
		var planning = $('.jqcal').data('planning');
		
		
		// unbind this event from the fulltimeslots
		if(this.model.get('fullDay')){
			var this_model = this.model;
			_.each(planning.get('days').models, function(day){
				day.get('fullTimeSlot').get('events').remove(this_model);
			});
		}
		
		// append it if it's in the planning
		var day = jqcal.time.inPlanning(this.model.get('starts_at'), this.model.get('ends_at'), planning, plugin);
		if(day) {
			if(this.model.get('fullDay')){
				this.setTemplate();
				if(! this.model.get('fullTimeSlot_view')) {
					// search for the timeSlot container
					var fullTimeSlot_view = day.get('fullTimeSlot').get('view');
					// store the timeSlot_view inside the Event		
					this.model.set('fullTimeSlot_view', fullTimeSlot_view);
					// display the view
					$('#jqcal_div_fulltimeslots').append(this.$el);
				}
			}
			else {
				this.setTemplate();
				if(! this.model.get('timeSlot_view')) {
					// search for the timeSlot container
					var i = 0, timeSlots = day.get('timeSlots').models;
					if(!(this.model.get('starts_at') < timeSlots[0].get('starts_at'))) {
						while(this.model.get('starts_at') >= day.get('timeSlots').models[i].get('ends_at')) {
							i++;
						}
					}
					
					// store the timeSlot_view inside the Event
					this.model.set('timeSlot_view', timeSlots[i].get('view'));
					// display the view
					$('#jqcal_calendar_events').append(this.$el);
				}
			}
		}
		
		// for the events in the planning (#jqcal_timeslots)
		if(timeSlot_view = this.model.get('timeSlot_view')) {
			var toDisplay = [];
			if(this.model.get('ends_at') <= jqcal.time.addHours(day.get('date'), plugin.get('day_ends_at'))) {	
				toDisplay.push(Math.ceil((this.model.get('ends_at') - timeSlot_view.model.get('starts_at')) / (plugin.get('day_fraction') * 60*60*1000)));
			}
			else {
				toDisplay.push((jqcal.time.addHours(day.get('date'), plugin.get('day_ends_at')) - timeSlot_view.model.get('starts_at')) / (plugin.get('day_fraction') * 60*60*1000));
				var from = _.indexOf(planning.get('days').models, day) + 1;
				for(var i = from; i < planning.get('days').models.length; i++) {
					if(this.model.get('ends_at') <= planning.get('days').models[i].get('timeSlots').models[0].get('starts_at')) {
						break;
					}
					else if(this.model.get('ends_at') <= jqcal.time.addHours(planning.get('days').models[i].get('date'), plugin.get('day_ends_at'))) {
						toDisplay.push({
							day: planning.get('days').models[i],
							length: Math.ceil((this.model.get('ends_at') - planning.get('days').models[i].get('timeSlots').models[0].get('starts_at')) / (plugin.get('day_fraction') * 60*60*1000))
						});
						break;
					}
					else {
						toDisplay.push({
							day: planning.get('days').models[i],
							length:(plugin.get('day_ends_at') - plugin.get('day_starts_at')) / plugin.get('day_fraction')
						});
					}
				}
			}

			// apply the css
			
			// border style
			this.$el.css('border', '1px');
			this.$el.css('borderStyle', 'groove');
			this.$el.css('borderColor', 'purple');
			this.$el.css('borderRadius', '3px');
			this.$el.css('overflow', 'hidden');
			
			//height
			var event_height = toDisplay[0] * timeSlot_view.$el.parent().outerHeight() - 1;
			
			scroll = _.isNumber(scroll) ? scroll : 0;
			if($.browser.mozilla) {
				var offset = {
					top: timeSlot_view.$el.offset().top,
					left: timeSlot_view.$el.offset().left
				};
			}
			else if($.browser.webkit){
				var offset = {
					top: timeSlot_view.$el.offset().top /*+ 1*/ + scroll,
					left: timeSlot_view.$el.offset().left /*+ 1*/
				};
			}
			else if($.browser.msie){
				var offset = {
					top: timeSlot_view.$el.offset().top + scroll,
					left: timeSlot_view.$el.offset().left
				};
			}
			else{//a regler pour opera/safari etc
				var offset = {
					top: timeSlot_view.$el.offset().top + 1 ,
					left: timeSlot_view.$el.offset().left + 1
				};
			}
			// big override for ie7...
			if(document.documentMode == '7' && $.browser.msie) {
				var nb_days_displayed = planning.get('days').models.length;
				var index = Math.floor(nb_days_displayed/2);
				if(timeSlot_view.el.cellIndex > index){
					var offset = {
						top: timeSlot_view.$el.offset().top + scroll,
						left: timeSlot_view.$el.offset().left + 1
					};
				}
			}
			
			
			// set offset/height/width |  (width will be changed after by planning.render_multi_events()
			this.$el.css({
				width: timeSlot_view.$el.width() - 10,
				height: event_height
			}).offset(offset);

			// handles creation
			if(toDisplay.length > 1) {
				var selector = this.$el.children('.handle-s');
				if(selector[0]) {
					selector.remove();
				}
				if(!this.$el.children('.handle-n')[0]){
					this.$el.append('<div class = "handle-n" style = "position: absolute; cursor: n-resize; top: -3px; height : 5px; width: 100%"></div>');
				}
			}
			else {
				if(!this.$el.children('.handle-n')[0]){
					this.$el.append('<div class = "handle-n" style = "position: absolute; cursor: n-resize; top: -3px; height : 5px; width: 100%"></div>');
				}
				if(!this.$el.children('.handle-s')[0]){
					this.$el.append('<div class = "handle-s" style = "position: absolute; cursor: n-resize; bottom: -3px; height : 5px; width: 100%"></div>');
				}
			}

			// z-index = 100 if event isn't bind to a timeslot (creation/resize/drag)
			if(this.$el.hasClass('unbind')){
				this.$el.css('zIndex', 100);
			}
			
			// extra days
			toDisplay.shift();
			this.model.get('children').reset();
			for(var i in toDisplay) {
				var beginning = jqcal.time.addHours(toDisplay[i].day.get('date'), plugin.get('day_starts_at'));
				var eventExtended = new EventExtended({
					starts_at: beginning,
					ends_at: jqcal.time.addHours(beginning, (toDisplay[i].length)*plugin.get('day_fraction')),
					super_model: this.model,
					timeSlot_view: toDisplay[i].day.get('timeSlots').models[0].get('view')
				});
				
				this.model.get('children').push(eventExtended);
				
				new EventExtendedView({
					model: eventExtended,
					arg: toDisplay[i],
					last: i == (toDisplay.length - 1),
					unbind: this.$el.hasClass('unbind')
				});
			}
		}
		
		// for the full day events (#jqcal_fulltimeslots)
		if(fullTimeSlot_view = this.model.get('fullTimeSlot_view')) {
			var toDisplay = [];
			var i = _.indexOf(planning.get('days').models, day);

			while(planning.get('days').models[i] && this.model.get('ends_at') >= jqcal.time.addHours(planning.get('days').models[i].get('date'), 24)){
				toDisplay.push(planning.get('days').models[i]);
				i++;
			}

			// apply the css
			
			// border style
			this.$el.css('border', '1px');
			this.$el.css('borderStyle', 'groove');
			this.$el.css('borderColor', 'red');
			this.$el.css('borderRadius', '5px');
			this.$el.css('overflow', 'hidden');
			
			//height
			var event_height = $('#jqcal_days').outerHeight() - 10;
			
			//width
			var event_width = toDisplay.length * (fullTimeSlot_view.$el.width() +4) - 10;
			
			//offset
			var offset = {
				top: fullTimeSlot_view.$el.offset().top,
				left: fullTimeSlot_view.$el.offset().left
			};
			
			for(var d in toDisplay){
				if(!toDisplay[d].get('fullTimeSlot').get('events').getByCid(this.model.cid)){
					toDisplay[d].get('fullTimeSlot').get('events').push(this.model);
				}
			}
		
			//set offset/height/width |  (width will be changed after by planning.render_multi_events()
			this.$el.css({
				width: event_width,
				height: event_height
			}).offset(offset);

			//handles creation
			if(!this.$el.children('.handle-e')[0]){
				this.$el.append('<div class = "handle-e" style = "position: absolute; cursor: e-resize; top: 0px; right: -3px; height : 100%; width: 5px;"></div>');
			}
			if(!this.$el.children('.handle-w')[0]){
				this.$el.append('<div class = "handle-w" style = "position: absolute; cursor: e-resize; top: 0px; left: -3px; height : 100%; width: 5px;"></div>');
			}
		}
	},
	events: {
		'mousedown' : 'down'
	},
	read: function(e) {
		if(this.model.get('agenda') && _.indexOf($('.jqcal').data('plugin').get('no_perm_event'), 'read') == -1) {
			new EventReadView({
				el: $('#jqcal_event_read'),
				model: this.model
			});
		}
	},
	getCell: function(e) {
		// two different methods for events and full day events
		if(this.model.get('fullDay')){
			var scroll = $(window).scrollTop();
			var pos_table = $('#jqcal_fulltimeslots').position();
			var margin_left_table = parseInt($('#jqcal_fulltimeslots').css('margin-left'));
			var width = $('#jqcal_fulltimeslots').attr('column_width');
			var grille_x = Math.floor((e.clientX - pos_table.left - margin_left_table)/width);
			var result = $('#jqcal_fulltimeslots>tbody>:nth-child('+1+')>:nth-child('+(grille_x+1)+')');
			var result = $('#jqcal_fulltimeslots>tbody>:first-child>:nth-child('+(grille_x+1)+')');
			return result;
		}else {
			var scroll = $('#jqcal_calendar_events').scrollTop() + $(window).scrollTop();
			var pos_table = $('#jqcal_calendar_events').position();
			var margin_left_table = parseInt($('#jqcal_timeslots').css('margin-left'));
			var width = $('#jqcal_timeslots').attr('column_width');
			var height = $('#jqcal_calendar_events tr').outerHeight();
			var grille_x = Math.floor((e.clientX - pos_table.left - margin_left_table)/width);
			var grille_y = Math.floor((e.clientY+ scroll - pos_table.top)/height);
			var result = $('#jqcal_timeslots>tbody>:nth-child('+(grille_y+1)+')>:nth-child('+(grille_x+1)+')');
			return result;
		}
	},
	down: function(e) {
		var mouse_init = e;
		var self = this;
		
		var move = function(e) {
			if(Math.abs(e.clientX - mouse_init.clientX) > 10 || Math.abs(e.clientY - mouse_init.clientY) > 10){
				$('html').off('mouseup', up);
				$('html').off('mousemove', move);
				self.actions(mouse_init);
			}
		};
		
		var up = function(e) {
			$('html').off('mousemove', move);
			$('html').off('mouseup', up);
			self.read(mouse_init);
		};
		
		$('html').on('mouseup', up);
		$('html').on('mousemove', move);
	},
	actions: function(e) {
		if(this.model.get('agenda') && _.indexOf($('.jqcal').data('plugin').get('no_perm_event'), 'edit') == -1){
			var pos_top_init = this.$el.position().top;
			//full day events
			if(this.model.get('fullDay')){
				if($(e.target).hasClass('handle-e')){
					this.resize_e(e, pos_top_init);
				}
				else if($(e.target).hasClass('handle-w')){
					this.resize_w(e, pos_top_init);
				}
				else{
					this.drag_fd(e, pos_top_init);
				}
			}
			else {
				//get initial informations
				var infos_event = {
					zIndex: this.$el.css('zIndex'),
					offsetLeft: this.$el.position().left,
					width: this.$el.width()
				};
				var infos_extended = [];
				_.each(this.model.get('children').models, function(c) {
					var infos = {
						zIndex: c.get('view').$el.css('zIndex'),
						offsetLeft: c.get('view').$el.position().left,
						width: c.get('view').$el.width()
					};
					infos_extended.push(infos);
				});

				// get the day we must render
				var toRenderFromUnbind = this.model.unbindTimeslots();
				this.render();
				
				if($(e.target).hasClass('handle-n')){
					this.resize_n(e, toRenderFromUnbind, infos_event, infos_extended);
				}
				else if($(e.target).hasClass('handle-s')){
					this.resize_s(e, toRenderFromUnbind, infos_event, infos_extended);
				}
				else{
					this.drag(e, toRenderFromUnbind, infos_event, infos_extended);
				}
			}
		}
	},
	drag: function(e, toRenderFromUnbind, infos_event, infos_extended) {
		$('.jqcal').disableSelection();
		var model = this.model;
		var self = this;
		var cell_init = self.getCell(e);
		var start_at_init = parseInt(cell_init.attr('starts_at'));
		
		var event_length_1 =  model.get('starts_at') - cell_init.attr('starts_at');
		var event_length_2 = model.get('ends_at') - cell_init.attr('ends_at');
		var move = function(e) { 
			var cell = self.getCell(e);
			if(cell[0]){
				var cell_starts_at = cell.attr('starts_at');
				var cell_ends_at = cell.attr('ends_at');
				model.set({
					starts_at : parseInt(cell_starts_at) + event_length_1,
					ends_at: parseInt(cell_ends_at) + event_length_2
				});
			}
		};
		
		var up = function(e) {
			$('html').off('mousemove', move);
			$('html').off('mouseup', up);
			//no movement, render not required | we can use the initials informations to replace the event where it was.
			if(start_at_init == (model.get('starts_at') - event_length_1)){
				self.renderInit(infos_event, infos_extended);
			}
			else {
				// get the day to render
				var toRenderFromBind = model.bindTimeslots();
				
				// all the days to render (from bind and unbind)
				var toRender = _.union(toRenderFromBind, toRenderFromUnbind);
				
				self.$el.css('zIndex', '0');
				
				// render all the days we got from bind & unbind
				var planning = $('.jqcal').data('planning');
				planning.get('view').parse_days(toRender);
			}
		};
		
		$('html').on("mousemove", move);
		$('html').on('mouseup', up);
	},
	drag_fd: function(e, pos_top_init) { // drag full day event
		$('.jqcal').disableSelection();
		var model = this.model;
		var self = this;
		var cell_init = self.getCell(e);
		var start_at_init = parseInt(cell_init.attr('starts_at'));
		self.$el.css('zIndex', '100');
		
		var event_length_1 =  model.get('starts_at') - cell_init.attr('starts_at');
		var event_length_2 = model.get('ends_at') - cell_init.attr('ends_at');
		var move = function(e) { 
			var cell = self.getCell(e);
			if(cell[0]){
				var cell_starts_at = cell.attr('starts_at');
				var cell_ends_at = cell.attr('ends_at');
				model.set({
					starts_at : parseInt(cell_starts_at) + event_length_1,
					ends_at: parseInt(cell_ends_at) + event_length_2
				});
			}
			self.$el.offset({top: pos_top_init});
		};
		
		var up = function(e) {
			$('html').off('mousemove', move);
			$('html').off('mouseup', up);
			
			self.$el.css('zIndex', '0');
			$('.jqcal').data('planning').get('view').parse_full_day();
		};
		
		$('html').on("mousemove", move);
		$('html').on('mouseup', up);
	},
	creation: function(e) {
		$('.jqcal').disableSelection();
		var model = this.model;
		var ends_at_init = model.get('ends_at');
		var starts_at_init = model.get('starts_at');
		var self = this;
		self.model.unbindTimeslots();
		
		var move = function(e) {
			var cell = self.getCell(e);
			if(cell[0]){
				var self_starts_at = self.model.get('starts_at');
				var self_ends_at = self.model.get('ends_at');
				var cell_starts_at = cell.attr('starts_at');
				var cell_ends_at = cell.attr('ends_at');
				

				if(cell_starts_at <= self_ends_at && cell_starts_at >= starts_at_init){
					model.set({
						starts_at : parseInt(starts_at_init),
						ends_at: parseInt(cell_ends_at)
					});
				}
				else if(cell_starts_at > self_ends_at){
					model.set({
						starts_at : parseInt(starts_at_init),
						ends_at: parseInt(cell_ends_at)
					});
				}
				if(cell_ends_at >= self_starts_at && cell_ends_at <= ends_at_init){
					model.set({
						starts_at: parseInt(cell_starts_at),
						ends_at : parseInt(ends_at_init)
					});
				}
				else if(cell_ends_at < self_starts_at){
					model.set({
						starts_at: parseInt(cell_starts_at),
						ends_at : parseInt(ends_at_init)
					});
				}
			}
		};
		
		var up = function(e) {
			$('html').off('mousemove', move);
			$('html').off('mouseup', up);
			
			//affichage
			var planning = $('.jqcal').data('planning');
			var toRender = model.bindTimeslots()
			planning.get('view').parse_days(toRender);

			new EventCreateView({
				el: $('#jqcal_event_create'),
				model: model
			});
		};
				
		$('html').on("mousemove", move);
		$('html').on('mouseup', up);
	},
	creation_fd: function(e) { // creation full day event
		$('.jqcal').disableSelection();
		var model = this.model;
		var ends_at_init = model.get('ends_at');
		var starts_at_init = model.get('starts_at');
		var self = this;
		self.$el.css('zIndex', '100');
		
		var move = function(e) {
			var cell = self.getCell(e);
			if(cell[0]){
				var self_starts_at = self.model.get('starts_at');
				var self_ends_at = self.model.get('ends_at');
				var cell_starts_at = cell.attr('starts_at');
				var cell_ends_at = cell.attr('ends_at');
				

				if(cell_starts_at >= ends_at_init){
					model.set({
						starts_at : parseInt(starts_at_init),
						ends_at: parseInt(cell_ends_at)
					});
				}
				else if(cell_starts_at < self_ends_at){
					model.set({
						starts_at : parseInt(cell_starts_at),
						ends_at: parseInt(ends_at_init)
					});
				}
			}
		};
		
		var up = function(e) {
			$('html').off('mousemove', move);
			$('html').off('mouseup', up);
			self.$el.css('zIndex', '0');
			$('.jqcal').data('planning').get('view').parse_full_day();
			
			new EventCreateView({
				el: $('#jqcal_event_create'),
				model: model
			});
		};
				
		$('html').on("mousemove", move);
		$('html').on('mouseup', up);
	},
	resize_n: function(e, toRenderFromUnbind, infos_event, infos_extended) {
		var plugin = $('.jqcal').data('plugin');
		var model = this.model;
		var ends_at_init = model.get('ends_at');
		var starts_at_init = model.get('starts_at');
		var starts_at_default = ends_at_init - (plugin.get('day_fraction')*60*60*1000);
		var self = this;
		self.$el.css('cursor', 'n-resize');
		$('.jqcal').disableSelection();
		
	
		var move = function(e) {
			var cell = self.getCell(e);
			if(cell[0]){
				var cell_starts_at = cell.attr('starts_at');
				if(cell_starts_at < ends_at_init){
					model.set('starts_at', cell_starts_at);			
				}
				else{
					model.set({
						starts_at: starts_at_default,
						ends_at : ends_at_init
					});
				}
			}
		};
		
		var up = function(e) {
			$('html').off('mousemove', move);
			$('html').off('mouseup', up);
			self.$el.css('cursor', 'pointer');
			if(model.get('starts_at') == starts_at_init){
				self.renderInit(infos_event, infos_extended);
			}
			else {
				var toRenderFromBind = model.bindTimeslots();
				var toRender = _.union(toRenderFromBind, toRenderFromUnbind);
				self.$el.css('zIndex', '0');
				var planning = $('.jqcal').data('planning');
				planning.get('view').parse_days(toRender);
			}
		};
				
		$('html').on("mousemove", move);
		$('html').on('mouseup', up);
	},
	resize_s: function(e, toRenderFromUnbind, infos_event, infos_extended) {
		var plugin = $('.jqcal').data('plugin');
		var model = this.model;
		var starts_at_init = model.get('starts_at');
		var ends_at_init = model.get('ends_at');
		var ends_at_default = starts_at_init + (plugin.get('day_fraction')*60*60*1000);
		var self = this;
		self.$el.css('cursor', 'n-resize');
		$('.jqcal').disableSelection();
	
		var move = function(e) {
			var cell = self.getCell(e);
			if(cell[0]){
				var cell_ends_at = cell.attr('ends_at');
				
				if(cell_ends_at > starts_at_init){
					model.set('ends_at', cell_ends_at);
				}
				else{
					model.set({
						starts_at: starts_at_init,
						ends_at : ends_at_default
					});
				}
			}
		};
		
		var up = function(e) {
			$('html').off('mousemove', move);
			$('html').off('mouseup', up);
			self.$el.css('cursor', 'pointer');
			if(model.get('ends_at') == ends_at_init){
				self.renderInit(infos_event, infos_extended);
			}
			else {
				var toRenderFromBind = model.bindTimeslots();
				var toRender = _.union(toRenderFromBind, toRenderFromUnbind);
				self.$el.css('zIndex', '0');
				var planning = $('.jqcal').data('planning');
				planning.get('view').parse_days(toRender);
			}
		};
				
		$('html').on("mousemove", move);
		$('html').on('mouseup', up);
	},
	resize_w: function(e, pos_top_init) {
		var plugin = $('.jqcal').data('plugin');
		var model = this.model;
		var ends_at_init = model.get('ends_at');
		var starts_at_init = model.get('starts_at');
		var starts_at_default = ends_at_init - (plugin.get('day_fraction')*60*60*1000);
		var self = this;
		self.$el.css('cursor', 'e-resize');
		$('.jqcal').disableSelection();
		self.$el.css('zIndex', '100');
	
		var move = function(e) {
			var cell = self.getCell(e);
			if(cell[0]){
				var cell_starts_at = cell.attr('starts_at');
				if(cell_starts_at < ends_at_init){
					model.set('starts_at', cell_starts_at);			
				}
				else{
					model.set({
						starts_at: starts_at_default,
						ends_at : ends_at_init
					});
				}
			}
			self.$el.offset({top: pos_top_init});
		};
		
		var up = function(e) {
			$('html').off('mousemove', move);
			$('html').off('mouseup', up);
			self.$el.css('cursor', 'pointer');
			self.$el.css('zIndex', '0');
			$('.jqcal').data('planning').get('view').parse_full_day();
			
		};
				
		$('html').on("mousemove", move);
		$('html').on('mouseup', up);
	},
	resize_e: function(e, pos_top_init) {
		var plugin = $('.jqcal').data('plugin');
		var model = this.model;
		var starts_at_init = model.get('starts_at');
		var ends_at_init = model.get('ends_at');
		var ends_at_default = starts_at_init + (plugin.get('day_fraction')*60*60*1000);
		var self = this;
		self.$el.css('cursor', 'e-resize');
		$('.jqcal').disableSelection();
		self.$el.css('zIndex', '100');
		var move = function(e) {
			var cell = self.getCell(e);
			if(cell[0]){
				var cell_ends_at = cell.attr('ends_at');
				
				if(cell_ends_at > starts_at_init){
					model.set('ends_at', cell_ends_at);
				}
				else{
					model.set({
						starts_at: starts_at_init,
						ends_at : ends_at_default
					});
				}
			}
			self.$el.offset({top: pos_top_init});
		};
		
		var up = function(e) {
			$('html').off('mousemove', move);
			$('html').off('mouseup', up);
			self.$el.css('cursor', 'pointer');
			self.$el.css('zIndex', '0');
			$('.jqcal').data('planning').get('view').parse_full_day();
		};
				
		$('html').on("mousemove", move);
		$('html').on('mouseup', up);
	},
	getScroll: function() {
		return $('#jqcal_calendar_events').scrollTop();
	},
	setColor: function() {
		this.$el.css('backgroundColor', this.model.get('color') || '#FFDAB9');
	},
	setOpacity: function() {
		if(this.model.get('agenda')){
			var agenda = $('.jqcal').data('agendas').where({label: this.model.get('agenda')})[0];
			if((this.model.get('ends_at') <= $.now() && agenda.get('transparency_past'))
				|| (this.model.get('is_occurrence') && agenda.get('transparency_recurrency'))) {
				this.$el.css('opacity', 0.8);
				$('.' + this.model.cid).css('opacity', 0.8);
			}
			else {
				this.$el.css('opacity', 1);
				$('.' + this.model.cid).css('opacity', 1);
			}
		}
	},
	setTemplate: function() {
		var plugin = $('.jqcal').data('plugin');
		// instantiate the template
		if(this.model.get('fullDay')){
			var object = {
				label: this.model.get('label')
			};
			var self = this;
			_.each(jqcal.full_day_event, function(attribute) {
				if(_.indexOf(attribute.elements, 'view') != -1) {
					if(self.model.get(attribute.name) != undefined) {
						object[attribute.name] = self.model.get(attribute.name).toString();
					}
				}
			});
			var template = jqcal.templates.full_day_event(object);
		}
		else {
			var object = {
				starts_at: jqcal.time.timestampToTime(this.model.get('starts_at'), plugin.get('timezone_offset')),
				ends_at: jqcal.time.timestampToTime(this.model.get('ends_at'), plugin.get('timezone_offset')),
				label: this.model.get('label')
			};
			var self = this;
			_.each(jqcal.event, function(attribute) {
				if(_.indexOf(attribute.elements, 'view') != -1) {
					if(self.model.get(attribute.name) != undefined) {
						object[attribute.name] = self.model.get(attribute.name).toString();
					}
				}
			});
			var template = jqcal.templates.event(object);
		}
		this.$el.children(':first-child').html(template);
	},
	renderInit: function(infos_event, infos_extended) {
			// on remet le css initial
			this.$el.width(infos_event.width).offset({left: infos_event.offsetLeft + $('#jqcal_calendar_events').offset().left}).css('zIndex', infos_event.zIndex);
			for(var e in infos_extended) {
				var event_view = this.model.get('children').models[e].get('view');
				event_view.$el.width(infos_extended[e].width).offset({left: infos_extended[e].offsetLeft + $('#jqcal_calendar_events').offset().left}).css('zIndex', infos_extended[e].zIndex);
			}
			
			// on oublie pas de bind
			this.model.bindTimeslots();
	}
});

EventExtendedView = Backbone.View.extend({
	initialize: function(arg) {
		this.setColor = _.bind(this.setColor, this); 
		this.model.get('super_model').bind('change:color', this.setColor);
		
		this.$el.html('<div></div>').css({	position: 'absolute',
											cursor: 'pointer'}).addClass(this.model.get('super_model').cid);
											
											
		this.model.set({
			view: this
		});
		
		
		this.render(arg.arg, arg.last, arg.unbind);
		this.setColor();
		this.setOpacity();
		$('#jqcal_calendar_events').append(this.$el);
	},
	render: function(arg, last, unbind) {
		// get the plugin and the planning
		var plugin = $('.jqcal').data('plugin');
		var planning = $('.jqcal').data('planning');
		
		//get the timeslot_view
		var timeSlot_view = arg.day.get('timeSlots').models[0].get('view');
			
		// apply the css
		
		//border
		this.$el.css('border', '1px');
		this.$el.css('borderStyle', 'groove');
		this.$el.css('borderColor', 'purple');
		this.$el.css('borderRadius', '3px');
		
		// height 
		var event_height = arg.length * timeSlot_view.$el.parent().outerHeight() - 1;
		
		var position_table = $('#jqcal_calendar_events').position();
		var scroll = this.getScroll();
		if($.browser.mozilla) {
			var offset = {
				top: timeSlot_view.$el.offset().top - position_table.top + $('#jqcal_calendar_events').scrollTop(),
				left: timeSlot_view.$el.offset().left - position_table.left
			};
		}
		else if($.browser.webkit){
			var offset = {
				top: timeSlot_view.$el.offset().top /*+ 1*/ - position_table.top + scroll,
				left: timeSlot_view.$el.offset().left /*+ 1*/ - position_table.left
			};
		}
		else if($.browser.msie){
			var offset = {
				top: timeSlot_view.$el.offset().top - position_table.top + scroll,
				left: timeSlot_view.$el.offset().left - position_table.left
			};
		}
		else{//a regler pour opera/safari etc
			var offset = {
				top: timeSlot_view.$el.offset().top + 1 - position_table.top + scroll,
				left: timeSlot_view.$el.offset().left + 1 - position_table.left
			};
		}
		
		// big override pour ie7...
		if($.browser.msie && document.documentMode == '7') {
			var nb_days_displayed = planning.get('days').models.length;
			var index = Math.floor(nb_days_displayed/2); // méthode empirique (marche de 1 a 9 jours sauf 8)
			if(timeSlot_view.el.cellIndex > index){
				var offset = {
					top: timeSlot_view.$el.offset().top - position_table.top + scroll,
					left: timeSlot_view.$el.offset().left + 1 - position_table.left
				};
			}
		}
		
		//set offset | height | width (width will be changed after by planning.render_multi_events()
		this.$el.css({
			backgroundColor: this.model.get('color') || '#FFDAB9',
			width: timeSlot_view.$el.width() - 10,
			height: event_height
		}).offset(offset);
		
		// 
		if(unbind){
			this.$el.css('zIndex', 100);
		}
		
		//creation des handles
		if(last) {
				this.$el.append('<div class = "handle-s" style = "position: absolute; cursor: n-resize; bottom: -3px; height : 5px; width: 100%"></div>');
		}
	},
	events: {
		'mousedown': 'down'
	},
	read: function(e) {
		if(this.model.get('super_model').get('agenda') && _.indexOf($('.jqcal').data('plugin').get('no_perm_event'), 'read') == -1) {
			new EventReadView({
				el: $('#jqcal_event_read'),
				model: this.model.get('super_model')
			});
		}
	},
	getCell: function(e) {
		var scroll = $('#jqcal_calendar_events').scrollTop() + $(window).scrollTop();
		var pos_table = $('#jqcal_calendar_events').position();
		var margin_left_table = parseInt($('#jqcal_timeslots').css('margin-left'));
		var width = $('#jqcal_timeslots').attr('column_width');
		var height = $('#jqcal_calendar_events tr').outerHeight();
		var grille_x = Math.floor((e.clientX - pos_table.left - margin_left_table)/width);
		var grille_y = Math.floor((e.clientY+ scroll - pos_table.top)/height);
		var result = $('#jqcal_timeslots>tbody>:nth-child('+(grille_y+1)+')>:nth-child('+(grille_x+1)+')');
		return result;
	},
	down: function(e) {
		var mouse_init = e;
		var self = this;
		
		var move = function(e) {
			if(Math.abs(e.clientX - mouse_init.clientX) > 10 || Math.abs(e.clientY - mouse_init.clientY) > 10){
				$('html').off('mouseup', up);
				$('html').off('mousemove', move);
				self.actions(mouse_init);
			}
		};
		
		var up = function(e) {
			$('html').off('mousemove', move);
			$('html').off('mouseup', up);
			self.read(mouse_init);
		};
		
		$('html').on('mouseup', up);
		$('html').on('mousemove', move);
	},
	actions: function(e) {
		if(this.model.get('super_model').get('agenda') && _.indexOf($('.jqcal').data('plugin').get('no_perm_event'), 'edit') == -1){
			
			//collecte les infos initiales
			var super_model = this.model.get('super_model');
			var infos_event = {
				zIndex: super_model.get('view').$el.css('zIndex'),
				offsetLeft: super_model.get('view').$el.position().left,
				width: super_model.get('view').$el.width()
			};
			var infos_extended = [];
			_.each(super_model.get('children').models, function(c) {
				var infos = {
					zIndex: c.get('view').$el.css('zIndex'),
					offsetLeft: c.get('view').$el.position().left,
					width: c.get('view').$el.width()
				};
				infos_extended.push(infos);
			});
		
			var toRenderFromUnbind = this.model.get('super_model').unbindTimeslots();
			this.model.get('super_model').get('view').render();
			
			if($(e.target).hasClass('handle-s')){
				this.resize_s(e, toRenderFromUnbind, infos_event, infos_extended);
			}
			else{
				this.drag(e, toRenderFromUnbind, infos_event, infos_extended);
			}
		}
	},
	drag: function(e, toRenderFromUnbind, infos_event, infos_extended) {
		$('.jqcal').disableSelection();
		var plugin = $('.jqcal').data('plugin');
		var model = this.model.get('super_model');
		var self = this;
		var cell_init = self.getCell(e);
		self.$el.css('cursor', 'pointer');
		var start_at_init = parseInt(cell_init.attr('starts_at'));
		var event_length_1 =  model.get('starts_at') - cell_init.attr('starts_at');
		var event_length_2 = model.get('ends_at') - cell_init.attr('ends_at');
		
		var move = function(e) { 
			var cell = self.getCell(e);
			if(cell[0]){
				var cell_starts_at = cell.attr('starts_at');
				var cell_ends_at = cell.attr('ends_at');
				model.set({
					starts_at : parseInt(cell_starts_at) + event_length_1,
					ends_at: parseInt(cell_ends_at) + event_length_2
				});
			}
		};
		
		var up = function(e) {
			$('html').off('mousemove', move);
			$('html').off('mouseup', up);
			if(start_at_init == (model.get('starts_at') - event_length_1)){
				model.get('view').renderInit(infos_event, infos_extended);
			}
			else {
				var toRenderFromBind = model.bindTimeslots();
				var toRender = _.union(toRenderFromBind, toRenderFromUnbind);
				self.$el.css('zIndex', '0');
				var planning = $('.jqcal').data('planning');
				planning.get('view').parse_days(toRender);
			}
		};
		
		$('html').on("mousemove", move);
		$('html').on('mouseup', up);
	},
	resize_s: function(e, toRenderFromUnbind, infos_event, infos_extended) {
		var plugin = $('.jqcal').data('plugin');
		var model = this.model.get('super_model');
		var starts_at_init = model.get('starts_at');
		var ends_at_init = model.get('ends_at');
		var ends_at_default = starts_at_init + (plugin.get('day_fraction')*60*60*1000);
		var self = this;
		self.$el.css('cursor', 'n-resize');
		$('.jqcal').disableSelection();
	
		var move = function(e) {
			var cell = self.getCell(e);
			if(cell[0]){
				var cell_ends_at = cell.attr('ends_at');
				
				if(cell_ends_at > starts_at_init){
					model.set('ends_at', cell_ends_at);
				}
				else{
					model.set({
						starts_at: starts_at_init,
						ends_at : ends_at_default
					});
				}
			}
		};
		
		var up = function(e) {
			$('html').off('mousemove', move);
			$('html').off('mouseup', up);
			self.$el.css('cursor', 'pointer');
			if(model.get('ends_at') == ends_at_init){
				model.get('view').renderInit(infos_event, infos_extended);
			}
			else {
				var toRenderFromBind = model.bindTimeslots();
				var toRender = _.union(toRenderFromBind, toRenderFromUnbind);
				self.$el.css('zIndex', '0');
				var planning = $('.jqcal').data('planning');
				planning.get('view').parse_days(toRender);
			}
		};
				
		$('html').on("mousemove", move);
		$('html').on('mouseup', up);
	},
	getScroll: function() {
		return $('#jqcal_calendar_events').scrollTop();
	},
	setColor: function() {
		this.$el.css('backgroundColor', this.model.get('super_model').get('color') || '#FFDAB9');
	},
	setOpacity: function() {
		if(this.model.get('super_model').get('agenda')){
			var agenda = $('.jqcal').data('agendas').where({label: this.model.get('super_model').get('agenda')})[0];
			if((this.model.get('super_model').get('ends_at') <= $.now() && agenda.get('transparency_past'))
				|| (this.model.get('super_model').get('is_occurrence') && agenda.get('transparency_recurrency'))) {
				this.$el.css('opacity', 0.8);
				$('.' + this.model.get('super_model').cid).css('opacity', 0.8);
			}
			else {
				this.$el.css('opacity', 1);
				$('.' + this.model.get('super_model').cid).css('opacity', 1);
			}
		}
	}
});

// CRUD Event

EventCreateView = Backbone.View.extend({
	initialize: function() {
		$('.jqcal').data('plugin').removeDialogs();
		$('#jqcal_event_create').data('view', this).unbind('click button');
		this.render();
	},
	render: function() {
		// get the plugin
		var plugin = $('.jqcal').data('plugin');
		
		// instantiate the template
		var object = {
			starts_at: jqcal.time.timestampToTime(this.model.get('starts_at'), plugin.get('timezone_offset')),
			ends_at: jqcal.time.timestampToTime(this.model.get('ends_at'), plugin.get('timezone_offset')),
			agendas: []
		};
		_.each($('.jqcal').data('agendas').models, function(agenda) {
			object.agendas.push({label: agenda.get('label')});
		});
		var template = jqcal.templates.event_create(object);
		
		var self = this;
		// create the qtip window
		this.model.get('view').$el.qtip({
			content: {
				text: template,
				title: {
					text: 'Create an event.'
				}
			},
			show: {
				event: false,
				ready: true
			},
			hide: false,
			position: {
				container: this.$el,
				my: 'bottom left',
				at: 'top right',
				viewport: $(window)
			},
			style: {
				classes: 'ui-tooltip-shadow ui-tooltip-light'
			}
		});
		
							
		// recurrency
		$('[name = jqcal_event_create_recurrency]').click(function() {
			if($(this).is(':checked')) {
				new RecurrencyView({
					el: $('#jqcal_recurrency')
				});
			}
		});
		
		// apply the permissions
		if(_.indexOf(plugin.get('no_perm_event'), 'edit') != -1) {
			$('#jqcal_event_create_edit').remove();
		}
	},
	events: {
		'click button': 'button'
	},
	button: function(e) {
		var originalTarget = e.srcElement || e.originalEvent.explicitOriginalTarget;
		var action = $(originalTarget).attr('id').match(/_[a-zA-Z]+$/).toString().substr(1);
		if(action == 'create') {
			var object = {
				label: $('[name = jqcal_event_create_label]').val() || 'untitled',
				agenda: $('[name = jqcal_event_create_agenda]').val()
			};
			if($('[name = jqcal_event_create_recurrency]').is(':checked')) {
				object.recurrency = JSON.parse($('[name = jqcal_event_create_recurrency]').val());
			}
			for(var attribute in jqcal.event) {
				if(_.indexOf(jqcal.event[attribute].elements, 'create') != -1) {
					if(jqcal.event[attribute].type == 'radio') {
						var val = $('[name = jqcal_event_create_'+jqcal.event[attribute].name+']:checked').val();
					}
					else if(jqcal.event[attribute].type == 'checkbox') {
						var val = $('[name = jqcal_event_create_'+jqcal.event[attribute].name+']').is(':checked');
					}
					else {
						var val = $('[name = jqcal_event_create_'+jqcal.event[attribute].name+']').val();
					}
					if(!jqcal.event[attribute].check || jqcal.event[attribute].check(val) !== false) {
						object[jqcal.event[attribute].name] = val;
					}
					else {
						alert('Incorrect value for attribute: '+jqcal.event[attribute].name+'.');
						return false;
					}
				}
			}
			this.model.set(object);
			this.model.get('view').$el.qtip('destroy');
			this.$el.data('view', '');
		}
		else if(action == 'cancel') {
			if(this.model.get('fullDay')){
				var this_model = this.model;
				_.each($('.jqcal').data('planning').get('days').models, function(day){
					day.get('fullTimeSlot').get('events').remove(this_model);
				});
				$('.jqcal').data('planning').get('view').parse_full_day();
			}
			this.model.unbindTimeslots();
			$('.jqcal').data('plugin').removeDialogs();
		}
		else if(action == 'edit') {
			new EventEditView({
				el: $('#jqcal_event_edit'),
				model: this.model
			});
		}
	}
});

EventReadView = Backbone.View.extend({
	initialize: function() {
		$('.jqcal').data('plugin').removeDialogs();
		$('#jqcal_event_read').data('view', this).unbind('click button');
		this.render();
	},
	render: function() {
		// get the plugin
		var plugin = $('.jqcal').data('plugin');
		
		// instantiate the template
		var object = {
			starts_at: jqcal.time.timestampToTime(this.model.get('starts_at'), plugin.get('timezone_offset')),
			ends_at: jqcal.time.timestampToTime(this.model.get('ends_at'), plugin.get('timezone_offset')),
			label: this.model.get('label'),
			description: this.model.get('description'),
			agenda: this.model.get('agenda')
		};
		var self = this;
		_.each(jqcal.event, function(attribute) {
			if(_.indexOf(attribute.elements, 'read') != -1) {
				if(self.model.get(attribute.name) != undefined) {
					object[attribute.name] = self.model.get(attribute.name).toString();
				}
			}
		});
		var template = jqcal.templates.event_read(object);
		
		// create the qtip window
		this.model.get('view').$el.qtip({
			content: {
				text: template,
				title: {
					text: 'Event.'
				}
			},
			show: {
				event: false,
				ready: true
			},
			hide: false,
			position: {
				container: this.$el,
				my: 'bottom left',
				at: 'top right',
				viewport: $(window)
			},
			style: {
				classes: 'ui-tooltip-shadow ui-tooltip-light'
			}
		});
		
		// apply the permissions
		if(_.indexOf(plugin.get('no_perm_event'), 'edit') != -1) {
			$('#jqcal_event_read_edit').remove();
		}
		if(_.indexOf(plugin.get('no_perm_event'), 'delete') != -1) {
			$('#jqcal_event_read_delete').remove();
		}
	},
	events: {
		'click button': 'button'
	},
	button: function(e) {
		var originalTarget = e.srcElement || e.originalEvent.explicitOriginalTarget;
		var action = $(originalTarget).attr('id').match(/_[a-zA-Z]+$/).toString().substr(1);
		if(action == 'delete') {
			if(this.model.get('fullDay')){
				var this_model = this.model;
				_.each($('.jqcal').data('planning').get('days').models, function(day){
					day.get('fullTimeSlot').get('events').remove(this_model);
				});
				$('.jqcal').data('planning').get('view').parse_full_day();
			}
			if(this.model.get('is_occurrence') || this.model.get('recurrency')) {
				new EventDeleteView({
					el: $('#jqcal_event_delete'),
					model: this.model
				});
			}
			else {
				$('.jqcal').data('plugin').removeDialogs();
				var days = this.model.remove();
				$('.jqcal').data('planning').get('view').parse_days(days);
			}
		}
		else if(action == 'close') {
			$('.jqcal').data('plugin').removeDialogs();
		}
		else if(action == 'edit') {
			new EventEditView({
				el: $('#jqcal_event_edit'),
				model: this.model
			});
		}
	}
});

EventEditView = Backbone.View.extend({
	initialize: function() {
		$('#jqcal_event_edit').data('view', this).unbind('click button');
		$('.jqcal').data('plugin').removeDialogs();
		this.render();
	},
	render: function() {
		// get the plugin
		var plugin = $('.jqcal').data('plugin');
	
		// instantiate the template
		var object = {
			date_start: jqcal.time.timestampToDate(this.model.get('starts_at'), plugin.get('timezone_offset')),
			date_end: jqcal.time.timestampToDate(this.model.get('ends_at'), plugin.get('timezone_offset')),
			starts_at: jqcal.time.timestampToTime(this.model.get('starts_at'), plugin.get('timezone_offset')),
			ends_at: jqcal.time.timestampToTime(this.model.get('ends_at'), plugin.get('timezone_offset')),
			label: this.model.get('label'),
			description: this.model.get('description'),
			agendas: [],
			colors: []
		};
		_.each($('.jqcal').data('agendas').models, function(agenda) {
			object.agendas.push({agenda: agenda.get('label')});
		});
		_.each(jqcal.colors, function(color) {
			object.colors.push({color: color});
		});
		var self = this;
		_.each(jqcal.event, function(attribute) {
			if(_.indexOf(attribute.elements, 'edit') != -1) {
				object[attribute.name] = self.model.get(attribute.name);
			}
		});
		var template = jqcal.templates.event_edit(object);
		
		if(plugin.get('edit_dialog')) {
			// create the qtip window
			this.model.get('view').$el.qtip({
				content: {
					text: template,
					title: {
						text: 'Edit your event.'
					}
				},
				show: {
					event: false,
					ready: true
				},
				hide: false,
				position: {
					container: this.$el,
					my: 'center',
					at: 'center',
					viewport: $(window)
				},
				style: {
					classes: 'ui-tooltip-shadow ui-tooltip-light'
				}
			});
		}
		else {
			$('#jqcal_event_edit').css({
				zIndex: 1001,
				backgroundColor: 'white',
				width: $('.jqcal').width(),
				height: $('.jqcal').height()
			}).offset($('.jqcal').offset()).html(template);
		}
		
		
		// set the select on the right agenda
		if(self.model.get('agenda')) {
			$('[name = jqcal_event_edit_agenda]').val(self.model.get('agenda'));
		}
		
		// activate the color picker
		$('[name = jqcal_event_edit_color]').colourPicker({
			ico: './dependencies/jquery.colourPicker.gif',
			title: 'Pick a color.'
		});
		$('#jquery-colour-picker').css('zIndex', 15001);
		var color = self.model.get('color') ? self.model.get('color').substr(1) : $('.jqcal').data('agendas').models[0].get('color').substr(1);
		$('[name = jqcal_event_edit_color]').val(color).css('backgroundColor', '#' + $('[name = jqcal_event_edit_color]').val());
		
		// link agenda & color
		$('[name = jqcal_event_edit_agenda]').change(function() {
			$('[name = jqcal_event_edit_color]').val($('.jqcal').data('agendas').where({label: $('[name = jqcal_event_edit_agenda]').val()})[0].get('color').substr(1)).css('backgroundColor', '#' + $('[name = jqcal_event_edit_color]').val());
		});
		
		// recurrency
		$('[name = jqcal_event_edit_recurrency]').click(function() {
			if($(self).is(':checked')) {
				new RecurrencyView({
					el: $('#jqcal_recurrency')
				});
			}
		});
		
		_.each(jqcal.event, function(attribute) {
			if(attribute.type == 'radio') {
				$('[name = jqcal_event_edit_'+attribute.name+'][value = '+self.model.get(attribute.name)+']').attr('checked', 'checked');
			}
			else if(attribute.type == 'checkbox' && self.model.get(attribute.name)) {
				$('[name = jqcal_event_edit_'+attribute.name+']').attr('checked', 'checked');
			}
		});
		
		if(self.model.get('recurrency')) {
			$('[name = jqcal_event_edit_recurrency]').attr('checked', 'checked').val(JSON.stringify(self.model.get('recurrency')));
		}
		
		if(self.model.get('is_occurrence')) {
			$('[name = jqcal_event_edit_recurrency]').hide();
		}
	},
	events: {
		'click button': 'button'
	},
	button: function(e) {
		var originalTarget = e.srcElement || e.originalEvent.explicitOriginalTarget;
		var action = $(originalTarget).attr('id').match(/_[a-zA-Z]+$/).toString().substr(1);
		if(action == 'save') {
			// get the plugin
			var plugin = $('.jqcal').data('plugin');
			
			// set the model if the inputs are valid
			var starts_at = new Date($('[name = jqcal_event_edit_date_start]').val() + ' ' + $('[name = jqcal_event_edit_starts_at]').val());
			var ends_at = new Date($('[name = jqcal_event_edit_date_end]').val() + ' ' + $('[name = jqcal_event_edit_ends_at]').val());
			if(starts_at != 'Invalid Date' && ends_at != 'Invalid Date' && starts_at.getTime() < ends_at.getTime() && $('[name = jqcal_event_edit_color]').val().match(/^[0-9a-f]{6}/i)) {
				this.model.unbindTimeslots();
				
				var object = {
					starts_at: starts_at.getTime() - jqcal.time.getLocalTimezoneOffset() + plugin.get('timezone_offset'),
					ends_at: ends_at.getTime() - jqcal.time.getLocalTimezoneOffset() + plugin.get('timezone_offset'),
					label: $('[name = jqcal_event_edit_label]').val() || 'untitled',
					description: $('[name = jqcal_event_edit_description]').val(),
					agenda: $('[name = jqcal_event_edit_agenda]').val(),
					color: '#'+$('[name = jqcal_event_edit_color]').val(),
					timeSlot_view: null
				};
				
				if(!this.model.get('is_occurrence') && $('[name = jqcal_event_edit_recurrency]').is(':checked')) {
					object.recurrency = JSON.parse($('[name = jqcal_event_edit_recurrency]').val());
				}
				for(var attribute in jqcal.event) {
					if(_.indexOf(jqcal.event[attribute].elements, 'edit') != -1) {
						if(jqcal.event[attribute].type == 'radio') {
							var val = $('[name = jqcal_event_edit_'+jqcal.event[attribute].name+']:checked').val();
						}
						else if(jqcal.event[attribute].type == 'checkbox') {
							var val = $('[name = jqcal_event_edit_'+jqcal.event[attribute].name+']').is(':checked');
						}
						else {
							var val = $('[name = jqcal_event_edit_'+jqcal.event[attribute].name+']').val();
						}
						if(!jqcal.event[attribute].check || jqcal.event[attribute].check(val) !== false) {
							object[jqcal.event[attribute].name] = val;
						}
						else {
							alert('Incorrect value for attribute: '+jqcal.event[attribute].name+'.');
							return false;
						}
					}
				}
				this.model.set(object);
				this.model.bindTimeslots();
				plugin.removeDialogs();
				
				$('.jqcal').data('planning').get('view').parse_each_day();
			}
			else {
				alert('Specify valid dates, times and color.');
			}
		}
		else if(action == 'cancel') {
			this.model.unbindTimeslots();
			$('.jqcal').data('plugin').removeDialogs();
		}
	}
});

EventDeleteView = Backbone.View.extend({
	initialize: function() {
		$('.jqcal').data('plugin').removeDialogs();
		$('#jqcal_event_delete').data('view', this).unbind('click button');
		this.render();
	},
	render: function() {
		// get the plugin
		var plugin = $('.jqcal').data('plugin');
		
		// instantiate the template
		var template = jqcal.templates.event_delete({});
		
		// create the qtip window
		$('.jqcal').qtip({
			content: {
				text: template,
				title: {
					text: 'Delete options.'
				}
			},
			show: {
				event: false,
				ready: true
			},
			hide: false,
			position: {
				container: this.$el,
				my: 'bottom left',
				viewport: $(window),
				at: 'top right'
			},
			style: {
				classes: 'ui-tooltip-shadow ui-tooltip-light'
			}
		});
	},
	events: {
		'click button': 'button'
	},
	button: function(e) {
		var originalTarget = e.srcElement || e.originalEvent.explicitOriginalTarget;
		var action = $(originalTarget).attr('id').match(/_[a-zA-Z]+$/).toString().substr(1);
		if(action == 'delete') {
			switch($('[name = jqcal_event_delete]:checked').val()) {
				case 'all':
					var cid = this.model.get('is_occurrence') || this.model.cid;
					_.each(_.union(this.model.collection.where({is_occurrence: cid}), this.model.collection.getByCid(cid)), function(event) {
						event.remove();
					});
					break;
				case 'part':
					var ends_at = this.model.get('ends_at');
					var cid = this.model.get('is_occurrence') || this.model.cid;
					_.each(this.model.collection.where({is_occurrence: cid}), function(event) {
						if(event.get('starts_at') > ends_at) {
							event.remove();
						}
					});
					this.model.remove();
					break;
				case 'one':
					this.model.remove();
					break;
			}
			$('.jqcal').data('plugin').removeDialogs();
			$('.jqcal').data('planning').get('view').parse_days(days);
		}
		else if(action == 'cancel') {
			$('.jqcal').data('plugin').removeDialogs();
		}
	}
});

// CRUD Agenda

AgendaCreateView = Backbone.View.extend({
	initialize: function() {
		$('.jqcal').data('plugin').removeDialogs();
		$('#jqcal_agenda_create').data('view', this).unbind('click button');
		this.render();
	},
	render: function() {
		// get the plugin
		var plugin = $('.jqcal').data('plugin');
		
		// instantiate the template
		var object = {
			colors: []
		};
		_.each(jqcal.colors, function(color) {
			object.colors.push({color: color});
		});
		var template = jqcal.templates.agenda_create(object);
		
		// create the qtip window
		$('#jqcal_agendas_new_button').qtip({
			content: {
				text: template,
				title: {
					text: 'Create an agenda.'
				}
			},
			show: {
				event: false,
				ready: true
			},
			hide: false,
			position: {
				container: this.$el,
				my: 'bottom left',
				viewport: $(window),
				at: 'top right'
			},
			style: {
				classes: 'ui-tooltip-shadow ui-tooltip-light'
			}
		});
		
							
		// activate the color picker
		$('[name = jqcal_agenda_create_color]').colourPicker({
			ico: './dependencies/jquery.colourPicker.gif',
			title: 'Pick a color.'
		});
		$('#jquery-colour-picker').css('zIndex', 15001);
	},
	events: {
		'click button': 'button'
	},
	button: function(e) {
		var originalTarget = e.srcElement || e.originalEvent.explicitOriginalTarget;
		var action = $(originalTarget).attr('id').match(/_[a-zA-Z]+$/).toString().substr(1);
		if(action == 'create') {
			// get the agendas
			var agendas = $('.jqcal').data('agendas');
		
			var label = $('[name = jqcal_agenda_create_label]').val();
			if(!label) {
				alert('The label cannot be empty.');
			}
			else if(agendas.where({label: label}).length) {
				alert('An agenda labelled '+label+' already exists.');
			}
			else {
				var object = {
					label: label,
					description: $('[name = jqcal_agenda_create_description]').val() || 'no description',
					color: '#'+$('[name = jqcal_agenda_create_color]').val(),
					transparency_past: $('[name = jqcal_agenda_create_transparency_past]').is(':checked'),
					transparency_recurrency: $('[name = jqcal_agenda_create_transparency_recurrency]').is(':checked')
				};
				for(var attribute in jqcal.agenda) {
					if(_.indexOf(jqcal.event[attribute].elements, 'create') != -1) {
						if(jqcal.event[attribute].type == 'radio') {
							var val = $('[name = jqcal_agenda_create_'+jqcal.event[attribute].name+']:checked').val();
						}
						else if(jqcal.event[attribute].type == 'checkbox') {
							var val = $('[name = jqcal_agenda_create_'+jqcal.event[attribute].name+']').is(':checked');
						}
						else {
							var val = $('[name = jqcal_agenda_create_'+jqcal.event[attribute].name+']').val();
						}
						if(!jqcal.event[attribute].check || jqcal.event[attribute].check(val) !== false) {
							object[jqcal.event[attribute].name] = val;
						}
						else {
							alert('Incorrect value for attribute: '+jqcal.event[attribute].name+'.');
							return false;
						}
					}
				}
				var agenda = new Agenda(object);
				agendas.push(agenda);
				new AgendaView({
					model: agenda
				});
				$('.jqcal').data('plugin').removeDialogs();
			}
		}
		else if(action == 'cancel') {
			$('.jqcal').data('plugin').removeDialogs();
		}
	}
});

AgendaReadView = Backbone.View.extend({
	initialize: function() {
		$('.jqcal').data('plugin').removeDialogs();
		$('#jqcal_agenda_read').data('view', this).unbind('click button');
		this.render();
	},
	render: function() {
		// get the plugin
		var plugin = $('.jqcal').data('plugin');
	
		// instantiate the template
		var object = {
			label: this.model.get('label'),
			description: this.model.get('description'),
			color: this.model.get('color'),
			transparency_past: this.model.get('transparency_past'),
			transparency_recurrency: this.model.get('transparency_recurrency')
		};
		var self = this;
		_.each(jqcal.agenda, function(attribute) {
			if(_.indexOf(attribute.elements, 'read') != -1) {
				if(self.model.get(attribute.name) != undefined) {
					object[attribute.name] = self.model.get(attribute.name).toString();
				}
			}
		});
		var template = jqcal.templates.agenda_read(object);
		
		// create the qtip window
		this.model.get('view').$el.qtip({
			content: {
				text: template,
				title: {
					text: 'Agenda.'
				}
			},
			show: {
				event: false,
				ready: true
			},
			hide: false,
			position: {
				container: this.$el,
				my: 'bottom left',
				viewport: $(window),
				at: 'top right'
			},
			style: {
				classes: 'ui-tooltip-shadow ui-tooltip-light'
			}
		});
		
							
		// apply the permissions
		if(_.indexOf(plugin.get('no_perm_agenda'), 'edit') != -1) {
			$('#jqcal_agenda_read_edit').remove();
		}
		if(_.indexOf(plugin.get('no_perm_agenda'), 'delete') != -1) {
			$('#jqcal_agenda_read_delete').remove();
		}
	},
	events: {
		'click button': 'button'
	},
	button: function(e) {
		var originalTarget = e.srcElement || e.originalEvent.explicitOriginalTarget;
		var action = $(originalTarget).attr('id').match(/_[a-zA-Z]+$/).toString().substr(1);
		if(action == 'delete') {
			if(confirm('Are you sure? Doing so will remove any event in this agenda.')) {
				$('.jqcal').data('plugin').removeDialogs();
				this.model.remove();
			}
		}
		else if(action == 'close') {
			$('.jqcal').data('plugin').removeDialogs();
		}
		else if(action == 'edit') {
			new AgendaEditView({
				el: $('#jqcal_agenda_edit'),
				model: this.model
			});
		}
	}
});

AgendaEditView = Backbone.View.extend({
	initialize: function() {
		$('.jqcal').data('plugin').removeDialogs();
		$('#jqcal_agenda_edit').data('view', this).unbind('click button');
		this.render();
	},
	render: function() {
		// instantiate the template
		var object = {
			label: this.model.get('label'),
			description: this.model.get('description'),
			colors: []
		};
		_.each(jqcal.colors, function(color) {
			object.colors.push({color: color});
		});
		var self = this;
		_.each(jqcal.agenda, function(attribute) {
			if(_.indexOf(attribute.elements, 'edit') != -1) {
				object[attribute.name] = self.model.get(attribute.name);
			}
		});
		var template = jqcal.templates.agenda_edit(object);
		
		if($('.jqcal').data('plugin').get('edit_dialog')) {
			// create the qtip window
			this.model.get('view').$el.qtip({
				content: {
					text: template,
					title: {
						text: 'Edit your agenda.'
					}
				},
				show: {
					event: false,
					ready: true
				},
				hide: false,
				position: {
					container: this.$el,
					my: 'bottom left',
					viewport: $(window),
					at: 'top right'
				},
				style: {
					classes: 'ui-tooltip-shadow ui-tooltip-light'
				}
			});
			
			// activate the color picker
			$('[name = jqcal_agenda_edit_color]').colourPicker({
				ico: './dependencies/jquery.colourPicker.gif',
				title: 'Pick a color.'
			});
			$('#jquery-colour-picker').css('zIndex', 15001);
			$('[name = jqcal_agenda_edit_color]').val(self.model.get('color').substr(1)).css('backgroundColor', '#' + $('[name = jqcal_agenda_edit_color]').val());
			
			// set the transparency_past checkbox
			if(self.model.get('transparency_past')) {
				$('[name = jqcal_agenda_edit_transparency_past]').attr('checked', 'checked');
			}
			
			// set the transparency_recurrency checkbox
			if(self.model.get('transparency_recurrency')) {
				$('[name = jqcal_agenda_edit_transparency_recurrency]').attr('checked', 'checked');
			}
			
			_.each(jqcal.agenda, function(attribute) {
				if(attribute.type == 'radio') {
					$('[name = jqcal_event_edit_'+attribute.name+'][value = '+self.model.get(attribute.name)+']').attr('checked', 'checked');
				}
				else if(attribute.type == 'checkbox' && self.model.get(attribute.name)) {
					$('[name = jqcal_event_edit_'+attribute.name+']').attr('checked', 'checked');
				}
			});
		}
		else {
			$('#jqcal_agenda_edit').css({
				zIndex: 1001,
				backgroundColor: 'white',
				width: $('.jqcal').width(),
				height: $('.jqcal').height()
			}).offset($('.jqcal').offset()).html(template);
		}
	},
	events: {
		'click button': 'button'
	},
	button: function(e) {
		var originalTarget = e.srcElement || e.originalEvent.explicitOriginalTarget;
		var action = $(originalTarget).attr('id').match(/_[a-zA-Z]+$/).toString().substr(1);
		if(action == 'save') {
			var label = $('[name = jqcal_agenda_edit_label]').val();
			if(!label) {
				alert('The label cannot be empty.');
			}
			else if($('.jqcal').data('agendas').where({label: label}).length && label != this.model.get('label')) {
				alert('An agenda labelled '+label+' already exists.');
			}
			else {
				var object = {
					label: label,
					description: $('[name = jqcal_agenda_edit_description]').val() || 'no description',
					color: '#'+$('[name = jqcal_agenda_edit_color]').val(),
					transparency_past: $('[name = jqcal_agenda_edit_transparency_past]').is(':checked')
				};
				for(var attribute in jqcal.agenda) {
					if(_.indexOf(jqcal.event[attribute].elements, 'edit') != -1) {
						if(jqcal.event[attribute].type == 'radio') {
							var val = $('[name = jqcal_agenda_edit_'+jqcal.event[attribute].name+']:checked').val();
						}
						else if(jqcal.event[attribute].type == 'checkbox') {
							var val = $('[name = jqcal_agenda_edit_'+jqcal.event[attribute].name+']').is(':checked');
						}
						else {
							var val = $('[name = jqcal_agenda_edit_'+jqcal.event[attribute].name+']').val();
						}
						if(!jqcal.event[attribute].check || jqcal.event[attribute].check(val) !== false) {
							object[jqcal.event[attribute].name] = val;
						}
						else {
							alert('Incorrect value for attribute: '+jqcal.event[attribute].name+'.');
							return false;
						}
					}
				}
				this.model.set(object);
				$('.jqcal').data('plugin').removeDialogs();
			}
		}
		else if(action == 'cancel') {
			$('.jqcal').data('plugin').removeDialogs();
		}
	}
});

// Recurrency

RecurrencyView = Backbone.View.extend({
	initialize: function() {
		var context = $('#jqcal_event_create').data('view') ? 'create' : 'edit';
		$('[name = jqcal_event_'+context+'_recurrency]').removeAttr('checked');
		$('.jqcal').qtip('destroy');
		$('#jqcal_recurrency').data('view', this).unbind('click button');
		this.render();
	},
	render: function() {
		// instantiate the template
		var template = jqcal.templates.recurrency({});
		var self = this;
		// create the qtip window
		$('.jqcal').qtip({
			content: {
				text: template,
				title: {
					text: 'Recurrency.'
				}
			},
			show: {
				event: false,
				ready: true
			},
			hide: false,
			position: {
				container: this.$el,
				my: 'center',
				at: 'center',
				viewport: $(window)
			},
			style: {
				classes: 'ui-tooltip-shadow ui-tooltip-light'
			}
		});	
		
		$('#jqcal_recurrency_type').change(function() {
			switch($(this).val()) {
				case 'daily':
				case 'yearly':
					$('#jqcal_recurrency_when_weekly, #jqcal_recurrency_when_monthly').html('');
					break;
				case 'weekly':
					var plugin = $('.jqcal').data('plugin');
					var minDays = jqcal.dates.minDays;
					$('#jqcal_recurrency_when_weekly').html('When:<br />');
					for(var i=0; i<7; i++) {
						$('#jqcal_recurrency_when_weekly').append('<input type="checkbox" name="jqcal_recurrency_when_weekly" value="'+i+'" checked="checked" /><label>'+minDays[i]+'</label>');
					}
					$('#jqcal_recurrency_when_monthly').html('');
					break;
				case 'monthly':
					$('#jqcal_recurrency_when_weekly').html('');
					$('#jqcal_recurrency_when_monthly').html('When:<br />'+
						'<input type="radio" name="jqcal_recurrency_when_monthly" value="week_day" /><label>Day of the week</label><br />'+
						'<input type="radio" name="jqcal_recurrency_when_monthly" value="month_day" checked="checked" /><label>Day of the month</label>');
					break;
			}
		});
		
		$('[name = jqcal_recurrency_end]').click(function() {
			switch($(this).val()) {
				case 'never':
					$('#jqcal_recurrency_on_date').attr('disabled', 'disabled');
					$('#jqcal_recurrency_after_number').attr('disabled', 'disabled');
					break;
				case 'on':
					$('#jqcal_recurrency_on_date').removeAttr('disabled');
					$('#jqcal_recurrency_after_number').attr('disabled', 'disabled');
					break;
				case 'after':
					$('#jqcal_recurrency_on_date').attr('disabled', 'disabled');
					$('#jqcal_recurrency_after_number').removeAttr('disabled');
					break;
			}
		});
	},
	events: {
		'click button': 'button'
	},
	button: function(e) {
		var originalTarget = e.srcElement || e.originalEvent.explicitOriginalTarget;
		var action = $(originalTarget).attr('id').match(/_[a-zA-Z]+$/).toString().substr(1);
		if(action == 'ok') {
			if(!$('#jqcal_recurrency_every').val().match(/^[1-9]$|^\d{2,}$/)) {
				alert('The "every" input must be filled by a valid number.');
				return false;
			}
			if($('[name = jqcal_recurrency_end]:checked').val() == 'on' && new Date($('#jqcal_recurrency_on_date').val()) == 'Invalid Date') {
				alert('The "on" input must be filled by a valid date (format: yyyy/mm/dd).');
				return false;
			}
			if($('[name = jqcal_recurrency_end]:checked').val() == 'after' && !$('#jqcal_recurrency_after_number').val().match(/^[1-9]$|^\d{2,}$/)) {
				alert('The "after" input must be filled by a valid number.');
				return false;
			}
			if($('#jqcal_recurrency_type').val() == 'weekly' && !$('[name = jqcal_recurrency_when_weekly]:checked').size()) {
				alert('No day was picked.');
				return false;
			}
			var recurrency = {
				type: $('#jqcal_recurrency_type').val(),
				every: parseInt($('#jqcal_recurrency_every').val())
			};
			if($('#jqcal_recurrency_type').val() == 'weekly') {
				var days = [];
				$('[name = jqcal_recurrency_when_weekly]:checked').each(function(checked_day) {
					days.push($(this).val());
				});
				recurrency['when'] = days;
			}
			else if($('#jqcal_recurrency_type').val() == 'monthly') {
				recurrency['when'] = $('[name = jqcal_recurrency_when_monthly]:checked').val();
			}
			if($('[name = jqcal_recurrency_end]:checked').val() == 'on') {
				recurrency['ends_on'] = new Date($('#jqcal_recurrency_on_date').val()).getTime();
			}
			else if($('[name = jqcal_recurrency_end]:checked').val() == 'after') {
				recurrency['ends_after'] = parseInt($('#jqcal_recurrency_after_number').val());
			}
			var context = $('#jqcal_event_create').data('view') ? 'create' : 'edit';
			$('[name = jqcal_event_'+context+'_recurrency]').val(JSON.stringify(recurrency)).attr('checked', 'checked');
			$('.jqcal').qtip('destroy');
			this.$el.data('view', '');
		}
		else if(action == 'cancel') {
			$('.jqcal').qtip('destroy');
			this.$el.data('view', '');
		}
	}
});