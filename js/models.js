Plugin = Backbone.Model.extend({
	removeDialogs: function() {
		// delete the existing CRUD dialog and everything it implies
		if($('#jqcal_event_create').data('view')) {
			var dialog = $('#jqcal_event_create').data('view');
			dialog.model.get('view').$el.qtip('destroy');
			if(!$('#jqcal_event_edit').data('view')) {
				if($('.jqcal').data('planning').get('format') == 'month' || $('.jqcal').data('planning').get('format') == 'custom_week'){
					var toRender = dialog.model.unbindTimeslots();
					dialog.model.get('view').remove();
					$('.jqcal').data('planning').get('view').parse_weeks(toRender);
				}
				else {
					if(dialog.model.get('full_day')){
						var this_model = dialog.model;
						_.each($('.jqcal').data('planning').get('days').models, function(day){
							day.get('fullTimeSlot').get('events').remove(this_model);
						});
						$('.jqcal').data('planning').get('view').parse_full_day();
					}
					var toRender = dialog.model.unbindTimeslots();
					dialog.model.get('view').remove();
					$('.jqcal').data('planning').get('view').parse_days(toRender);
				}
				$('.'+dialog.model.cid).remove();
			}
			$('#jqcal_event_create').data('view', '');
		}
		else if($('#jqcal_event_read').data('view')) {
			$('#jqcal_event_read').data('view').model.get('view').$el.qtip('destroy');
			$('#jqcal_event_read').data('view', '');
		}
		else if($('#jqcal_event_edit').data('view')) {
			var dialog = $('#jqcal_event_edit').data('view');
			if(this.get('edit_dialog')) {
				dialog.model.get('view').$el.qtip('destroy');
			}
			else {
				$('#jqcal_event_edit').css({
					width: 0,
					height: 0
				}).html('')
			}
			if(!dialog.model.get('agenda')) {
				if($('.jqcal').data('planning').get('format') == 'month' || $('.jqcal').data('planning').get('format') == 'custom_week'){
					var toRender = dialog.model.unbindTimeslots();
					dialog.model.get('view').remove();
					$('.jqcal').data('planning').get('view').parse_weeks(toRender);
				}
				else {
					if(dialog.model.get('full_day')){
						var this_model = dialog.model;
						_.each($('.jqcal').data('planning').get('days').models, function(day){
							day.get('fullTimeSlot').get('events').remove(this_model);
						});
						$('.jqcal').data('planning').get('view').parse_full_day();
					}
					var toRender = dialog.model.unbindTimeslots();
					dialog.model.get('view').remove();
					$('.jqcal').data('planning').get('view').parse_days(toRender);
				}
				$('.'+dialog.model.cid).remove();
			}
			$('#jqcal_event_edit').data('view', '');
		}
		else if($('#jqcal_agenda_create').data('view')) {
			$('#jqcal_agendas_new_button').qtip('destroy');
			$('#jqcal_agenda_create').data('view', '');
		}
		else if($('#jqcal_agenda_read').data('view')) {
			$('#jqcal_agenda_read').data('view').model.get('view').$el.qtip('destroy');
			$('#jqcal_agenda_read').data('view', '');
		}
		else if($('#jqcal_agenda_edit').data('view')) {
			if(this.get('edit_dialog')) {
				$('#jqcal_agenda_edit').data('view').model.get('view').$el.qtip('destroy');
			}
			else {
				$('#jqcal_agenda_edit').css({
					width: 0,
					height: 0
				}).html('')
			}
			$('#jqcal_agenda_edit').data('view', '');
		}
		if($('#jqcal_event_delete').data('view')) {
			$('.jqcal').qtip('destroy');
			$('#jqcal_event_delete').data('view', '');
		}
		if($('#jqcal_recurrency').data('view')) {
			$('.jqcal').qtip('destroy');
			$('#jqcal_recurrency').data('view', '');
		}
	}
});

Planning = Backbone.Model.extend({
	initialize: function() {	
		this.setCollection();
		
		// bind onChange event
		this.bind('change:nb_days change:nb_weeks change:format change:starts_at', function() {
			this.setCollection();
		});
	},
	setCollection: function() {
		// get the plugin
		var plugin = $('.jqcal').data('plugin');

		if(this.get('format') == 'custom_week' || this.get('format') == 'month') {
			// get the number of weeks
			if(this.get('format') == 'month') {
				var month1 = (new Date(jqcal.time.addDays(this.get('starts_at'), 7))).getMonth();
				var nb_weeks = 1;
				while((new Date(jqcal.time.addDays(this.get('starts_at'), 7 * (nb_weeks)))).getMonth() == month1) {
					nb_weeks++;
				}
			}
			else {
				var nb_weeks = this.get('nb_weeks');
			}
			
			// instantiate the collection of weeks
			var collection = new Weeks();
			for(var i = 0; i < nb_weeks; i++) {
				var date = jqcal.time.addDays(this.get('starts_at'), i*7);
				collection.add(new Week({
					date: date
				}));
			}
			
			// set the collection
			this.set('weeks', collection);
		}
		else {
			// instantiate the collection of days
			var collection = new Days();
			switch(this.get('format')) {
				case 'day':
					var nb_days = 1;
					break;
				case 'custom_day':
					var nb_days = this.get('nb_days');
					break;
				case 'week':
					var nb_days = 7;
					break;
			}
			for(var i = 0; i < nb_days; i++) {
				var date = jqcal.time.addDays(this.get('starts_at'), i);
				
				if((this.get('format') != 'week') || (_.indexOf(plugin.get('hidden_days'), jqcal.time.timestampToDay(date, plugin.get('timezone_offset'))) == -1)) {
					collection.add(new Day({
						date: date
					}));
				}
			}
			
			// set the collection
			this.set('days', collection);
		}
	}
});

Day = Backbone.Model.extend({
	initialize: function() {
		// get the plugin
		var plugin = $('.jqcal').data('plugin');
	
		// instantiate the collection of timeSlots
		var collection = new TimeSlots();
		for(var i = 0; i < plugin.get('day_ends_at') - plugin.get('day_starts_at'); i+= plugin.get('day_fraction')) {
			var timeSlot = new TimeSlot({
				starts_at: jqcal.time.addHours(this.get('date'), plugin.get('day_starts_at') + i),
				ends_at: jqcal.time.addHours(this.get('date'), plugin.get('day_starts_at') + i + plugin.get('day_fraction'))
			});
			collection.add(timeSlot);
		}
		
		// instantiate the fullTimeSlot
		var fullTimeSlot = new FullTimeSlot({
			starts_at: this.get('date'),
			ends_at: jqcal.time.addHours(this.get('date'), 24)
		});
		
		//  set the attributes
		this.set({
			timeSlots: collection,
			fullTimeSlot: fullTimeSlot
		});
	}
});

FullTimeSlot = Backbone.Model.extend({
	initialize: function() {
		this.set({
			events: new Events
		});
	}
});

TimeSlot = Backbone.Model.extend({
	initialize: function() {
		this.set({
			events: new Events
		});
	}
});

Week = Backbone.Model.extend({
	initialize: function() {
		// instantiate the collection of timeSlots
		var collection = new DaySlots();
		for(var i = 0; i < 7; i++) {
			collection.add(new DaySlot({
				starts_at: jqcal.time.addDays(this.get('date'), i),
				ends_at: jqcal.time.addDays(this.get('date'), i+1)
			}));
		}
		
		//  set the attributes
		this.set({
			daySlots: collection
		});
	}
});

DaySlot = Backbone.Model.extend({
	initialize: function() {
		this.set({
			events: new Events
		});
	}
});

Agenda = Backbone.Model.extend({
	defaults: {
		label: 'default',
		description: 'no description',
		color: '#FFDAB9',
		display: true,
		transparency_past: true,
		transparency_recurrency: true
	},
	initialize: function() {
		this.set('events', new Events);
		this.on('change:label', this.setEventsAgenda).on('change:color', this.setEventsColor).on('change', this.onChange);
		
		// callback
		if(this.get('label') != 'default' && !this.get('id')) {
			var agenda = {
				cid: this.cid,
				label: this.get('label'),
				description: this.get('description'),
				color: this.get('color')
			}
			if(this.get('id')) {
				agenda.id = this.get('id');
			}
			var self = this;
			_.each(jqcal.agenda, function(attribute) {
				agenda[attribute.name] = self.get(attribute.name);
			});
			$('.jqcal').data('plugin').get('agenda_created')(agenda);
		}
	},
	remove: function() {
		// callback
		if(this.get('label') != 'default') {
			var agenda = {
				cid: this.cid
			}
			if(this.get('id')) {
				agenda.id = this.get('id');
			}
			$('.jqcal').data('plugin').get('agenda_removed')(agenda);
		}
		
		this.get('view').remove();
		var events = this.get('events').models;
		var l = events.length
		for(var i = 0; i < l; i++){
			events[0].remove();
		}
		this.collection.remove(this);
	},
	setEventsAgenda: function() {
		var self = this;
		_.each(this.get('events').models, function(event) {
			event.set('agenda', self.get('label'));
		});
	},
	setEventsColor: function() {
		var self = this;
		_.each(this.get('events').models, function(event) {
			if(event.get('color') == self.previous('color')) {
				event.set('color', self.get('color'));
			}
		});
	},
	onChange: function() {
		var agenda = this.changedAttributes();
		_.each(['id', 'view', 'display', 'transparency_past', 'transparency_recurrency'], function(attribute) {
			delete agenda[attribute];
		});
		if(_.keys(agenda).length) {
			agenda = _.extend(agenda, {cid: this.cid});
			if(this.get('id')) {
				agenda.id = this.get('id');
			}
			$('.jqcal').data('plugin').get('agenda_changed')(agenda);
		}
	}
});

Event = Backbone.Model.extend({
	defaults: {
		label: 'untitled',
		description: ''
	},
	/* Also has the following attributes:
	// starts_at
	// ends_at
	// agenda
	// color
	*/
	initialize: function() {
		this.set({
			children: new Events
		});
		if(this.get('agenda')) {
			this.setAgenda();
		}
		if(this.get('recurrency')) {
			this.createOccurrences();
		}
		this.on('change:agenda', this.setAgenda).on('change:starts_at', this.removeView).on('change:recurrency', this.createOccurrences);
	},
	setAgenda: function() {
		if($('.jqcal').data('agendas').where({label: this.previous('agenda')}).length || !this.previous('agenda')) {
			// tear off the event from his previous agenda
			if(agenda = $('.jqcal').data('agendas').where({events: this.collection})[0]) {
				agenda.get('events').remove(this);
				agenda.off('change:transparency_past change:transparency_recurrency', this.get('view').setOpacity);
			}
			else {
				if(!this.get('id')) {
					var collec = null;
					if(this.collection && !$('.jqcal').data('agendas').where({events: this.collection}).length) {
						//refaire collec
						var collec = this.collection;
						collec.remove(this);
					}
					// callback
					var event = {
						cid: this.cid,
						label: this.get('label'),
						description: this.get('description'),
						agenda: this.get('agenda'),
						color: this.get('color'),
						starts_at: this.get('starts_at'),
						ends_at: this.get('ends_at'),
						fullDay: this.get('fullDay')
					}
					if(this.get('recurrency')) {
						event.recurrency = this.get('recurrency');
					}
					if(this.get('id')) {
						event.id = this.get('id');
					}
					var self = this;
					_.each(jqcal.event, function(attribute) {
						event[attribute.name] = self.get(attribute.name);
					});
					$('.jqcal').data('plugin').get('event_created')(event);
				}
				
				this.on('change', this.onChange);
			}
			
			// push the event in the right agenda's collection
			agenda = $('.jqcal').data('agendas').where({label: this.get('agenda')})[0];
			
			// add the event to the agenda
			agenda.get('events').push(this);
			if(collec){
				collec.push(this);
			}
			if(this.get('view')) {
				agenda.on('change:transparency_past change:transparency_recurrency', this.get('view').setOpacity);
			}
			// set the event's color to the agenda's default color if no color has been specified
			if(!this.get('color')) {
				this.set('color', agenda.get('color'));
			}
		}
	},
	remove: function() {
		// get the planning
		var planning = $('.jqcal').data('planning');
	
		// callback
		var event = {
			cid: this.cid
		}
		if(this.get('id')) {
			event.id = this.get('id');
		}
		$('.jqcal').data('plugin').get('event_removed')(event);
		
		if(planning.get('format') == 'month' || planning.get('format') == 'custom_week'){
				$('.' + this.cid).remove();
				var toRender = this.unbindTimeslots();
				this.get('view').remove();
				this.collection.remove(this);
				return toRender;
		}
		else {
			// unbind this event from the fulltimeslots
			if(this.get('full_day')){
				var self = this;
				_.each(planning.get('days').models, function(day){
					day.get('fullTimeSlot').get('events').remove(self);
				});
				this.get('view').remove();
				this.collection.remove(this);
				return [];
			}
			else {
				$('.' + this.cid).remove();
				var toRender = this.unbindTimeslots();
				this.get('view').remove();
				this.collection.remove(this);
				return toRender;
			}
		}
	},
	removeView: function() {
		this.unbindTimeslots();
		this.unset('timeSlot_view');
		this.unset('fullTimeSlot_view');
		this.unset('daySlot_view');
		var children = this.get('children').models;
		for(var c in children){
				children[c].removeView();
		}
	},
	createOccurrences: function() {
		_.each(this.collection.where({is_occurrence: this.cid}), function(event) {
			event.remove();
		});
		var plugin = $('.jqcal').data('plugin');
		var recurrency = this.get('recurrency');
		var object = {
			agenda: this.get('agenda'),
			label: this.get('label'),
			description: this.get('description'),
			is_occurrence: this.cid
		};
		var self = this;
		_.each(jqcal.event, function(attribute) {
			object[attribute.name] = self.get(attribute.name);
		});
		var starts_at = this.get('starts_at');
		var ends_at = this.get('ends_at');
		switch(recurrency.type) {
			case 'daily':
				var i = 1;
				while((recurrency.ends_on && jqcal.time.addDays(this.get('ends_at'), i*recurrency.every) <= recurrency.ends_on)
				|| (recurrency.ends_after && i < recurrency.ends_after + 1)
				|| (!recurrency.ends_on && !recurrency.ends_after && jqcal.time.addDays(this.get('ends_at'), i*recurrency.every) <= plugin.get('calendar_ends_at'))) {
					new EventView({
						model: new Event(_.extend(object, {
							starts_at: jqcal.time.addDays(starts_at, i*recurrency.every),
							ends_at: jqcal.time.addDays(ends_at, i*recurrency.every)
						}))
					});
					i++;
				}
				break;
			case 'weekly':
				var date = (new Date(starts_at - $('.jqcal').data('plugin').get('timezone_offset') * 60000)).jqcal.time.getDay();
				var first_day = plugin.get('first_day');
				var diff = [];
				_.each(recurrency.when, function(day) {
					diff.push((day - first_day + 7)%7 - (date - first_day + 7)%7);
				});
				diff.sort(function(a,b) {return a-b;});
				
				var i = 0;
				var j = 0;
				while((recurrency.ends_on && jqcal.time.addDays(ends_at, j*recurrency.every*7) < recurrency.ends_on)
					|| (recurrency.ends_after && i < recurrency.ends_after)
					|| (!recurrency.ends_on && !recurrency.ends_after && jqcal.time.addDays(ends_at, j*recurrency.every*7) < plugin.get('calendar_ends_at'))) {
					_.each(diff, function(jump) {
						if(j != 0 || jump > 0) {
							if((recurrency.ends_on && jqcal.time.addDays(ends_at, jump + j*recurrency.every*7) < recurrency.ends_on)
								|| (recurrency.ends_after && i < recurrency.ends_after)
								|| (!recurrency.ends_on && !recurrency.ends_after && jqcal.time.addDays(ends_at, jump + j*recurrency.every*7) < plugin.get('calendar_ends_at'))) {
								new EventView({
									model: new Event(_.extend(object, {
										starts_at: jqcal.time.addDays(starts_at, jump + j*recurrency.every*7),
										ends_at: jqcal.time.addDays(ends_at, jump + j*recurrency.every*7)
									}))
								});
								i++;
							}
						}
					});
					j++;
				}
				break;
			case 'monthly':
				if(recurrency.when == 'month_day') {
					var date = (new Date(starts_at)).getDate();
					var i = 0;
					var j = 1;
					while((recurrency.ends_on && jqcal.time.addMonths(ends_at, j*recurrency.every) < recurrency.ends_on)
						|| (recurrency.ends_after && i < recurrency.ends_after)
						|| (!recurrency.ends_on && !recurrency.ends_after && jqcal.time.addMonths(ends_at, j*recurrency.every) < plugin.get('calendar_ends_at'))) {
						var new_starts_at = jqcal.time.addMonths(starts_at, j*recurrency.every);
						var new_ends_at = jqcal.time.addMonths(ends_at, j*recurrency.every);
						if((new Date(new_starts_at)).getDate() == date) {
							new EventView({
								model: new Event(_.extend(object, {
									starts_at: new_starts_at,
									ends_at: new_ends_at
								}))
							});
							i++;
						}
						j++;
					}
				}
				else if(recurrency.when == 'week_day') {
					var month = (new Date(starts_at)).getMonth();
					var i = 0;
					var j = 1;
					while((recurrency.ends_on && jqcal.time.getNthDay(starts_at, j*recurrency.every) < recurrency.ends_on)
						|| (recurrency.ends_after && i < recurrency.ends_after)
						|| (!recurrency.ends_on && !recurrency.ends_after && jqcal.time.getNthDay(starts_at, j*recurrency.every) < plugin.get('calendar_ends_at'))) {
						var new_starts_at = jqcal.time.getNthDay(starts_at, j*recurrency.every);
						var new_ends_at = jqcal.time.getNthDay(ends_at, j*recurrency.every);
						if((new Date(new_starts_at)).getMonth() == (month + j*recurrency.every)%12) {
							new EventView({
								model: new Event(_.extend(object, {
									starts_at: new_starts_at,
									ends_at: new_ends_at
								}))
							});
							i++;
						}
						j++;
					}
				}
				break;
			case 'yearly':
				var i = 1;
				while((recurrency.ends_on && jqcal.time.addYears(this.get('ends_at'), i*recurrency.every) <= recurrency.ends_on)
					|| (recurrency.ends_after && i < recurrency.ends_after + 1)
					|| (!recurrency.ends_on && !recurrency.ends_after && jqcal.time.addYears(this.get('ends_at'), i*recurrency.every) <= plugin.get('calendar_ends_at'))) {
					new EventView({
						model: new Event(_.extend(object, {
							starts_at: jqcal.time.addYears(starts_at, i*recurrency.every),
							ends_at: jqcal.time.addYears(ends_at, i*recurrency.every)
						}))
					});
					i++;
				}
				break;
		}
	},
	onChange: function() {
		var event = this.changedAttributes();
		_.each(['id', 'view', 'timeSlot_view', 'fullTimeSlot_view', 'daySlot_view'], function(attribute) {
			delete event[attribute];
		});
		if(_.keys(event).length) {
			event = _.extend(event, {cid: this.cid});
			if(this.get('id')) {
				event.id = this.get('id');
			}
			$('.jqcal').data('plugin').get('event_changed')(event);
		}
	},
	/*
	 * bind un event sur un timeslot ou un dayslot
	 *
	 *
	 */
	bindTimeslots: function() {
		var plugin = $('.jqcal').data('plugin');
		var planning = $('.jqcal').data('planning');
		
		if(planning.get('format') == 'month' || planning.get('format') == 'custom_week'){
			this.get('view').$el.removeClass('unbind');
			var weeks = planning.get('weeks');
			
			if(! this.get('daySlot_view')){
				var week = jqcal.time.inPlanning(this.get('starts_at'), this.get('ends_at'), planning, plugin);
			}
			else {
				var week = weeks.where({daySlots: this.get('daySlot_view').model.collection})[0]
			}
			if(!week) {
				return [];
			}
			else {
				if(! this.get('daySlot_view')){
					var i = 0, daySlots = week.get('daySlots').models;
					if(!(this.get('starts_at') < daySlots[0].get('starts_at'))) {
						while(this.get('starts_at') >= daySlots[i].get('ends_at')) {
							i++;
						}
					}
					var j = _.indexOf(daySlots, daySlots[i]);
				}
				else {
					var j = _.indexOf(week.get('daySlots').models, this.get('daySlot_view').model);
				}
				var result = [week];
				while(this.get('ends_at') > week.get('daySlots').models[j].get('starts_at')){
					week.get('daySlots').models[j].get('events').push(this);	
					j++;
					if(! week.get('daySlots').models[j]) {
							break;
					}
				}
				var children = this.get('children').models;
				for(var c in children){
					result = _.union(result, children[c].bindTimeslots());
				}
				return result;
			}
		}
		else {
			//on ne bind pas les events full_day
			if(this.get('full_day')){
				return [];
			}
			this.get('view').$el.removeClass('unbind');
			var days = planning.get('days');
			
			if(! this.get('timeSlot_view')){
				var day = jqcal.time.inPlanning(this.get('starts_at'), this.get('ends_at'), planning, plugin);
			}
			else {
				var day = days.where({timeSlots: this.get('timeSlot_view').model.collection})[0]
			}
			
			if(!day) {
				return [];
			}
			else {
				if(! this.get('timeSlot_view')){
					var i = 0, timeSlots = day.get('timeSlots').models;
					if(!(this.get('starts_at') < timeSlots[0].get('starts_at'))) {
						while(this.get('starts_at') >= day.get('timeSlots').models[i].get('ends_at')) {
							i++;
						}
					}
					var j = _.indexOf(day.get('timeSlots').models, timeSlots[i]);
				}
				else {
					var j = _.indexOf(day.get('timeSlots').models, this.get('timeSlot_view').model);
				}
				var result = [day];
				var result1 = [];
				while(this.get('ends_at') >= day.get('timeSlots').models[j].get('ends_at')){
					day.get('timeSlots').models[j].get('events').push(this);
					result1 = _.union(result1, day.get('timeSlots').models[j].get('events').models);
					
					j++;
					if(! day.get('timeSlots').models[j]) {
							break;
					}
				}
				var children = this.get('children').models;
				for(var c in children){
					result = _.union(result, children[c].bindTimeslots());
				}
				return result;
			}
		}
	},
	unbindTimeslots: function() {
		var planning = $('.jqcal').data('planning');
		var plugin = $('.jqcal').data('plugin');

		if(planning.get('format') == 'month' || planning.get('format') == 'custom_week'){
			//pour le render 
			this.get('view').$el.addClass('unbind');
			
			if(this.previous('daySlot_view')){
				var weeks = planning.get('weeks');
				var week = weeks.where({daySlots: this.previous('daySlot_view').model.collection})[0];
				if(week){
					var i = _.indexOf(week.get('daySlots').models, this.previous('daySlot_view').model);
					var result = [week];
					var all_events = [];
					while(this.previous('ends_at') > week.get('daySlots').models[i].get('starts_at')){
						all_events = _.union(all_events, week.get('daySlots').models[i].get('events').models);
						week.get('daySlots').models[i].get('events').remove(this);
						i++;
						if(! week.get('daySlots').models[i]) {
								break;
						}
					}
					
					var children = this.get('children').models;
					for(var c in children){
						result = _.union(result, children[c].unbindTimeslots());
					}
					return result;
				}
				else{
					return [];
				}
			}
			else {
				return [];
			}
		}
		else {
			if(this.get('full_day')){
				return [];
			}
			//pour le render 
			this.get('view').$el.addClass('unbind');
			if(this.previous('timeSlot_view')){
				var days = planning.get('days');
				var day = days.where({timeSlots: this.previous('timeSlot_view').model.collection})[0];
				if(day){
					var i = _.indexOf(day.get('timeSlots').models, this.previous('timeSlot_view').model);
					var result = [day];
					var all_events = [];
					while(this.previous('ends_at') >= day.get('timeSlots').models[i].get('ends_at')){
						all_events = _.union(all_events, day.get('timeSlots').models[i].get('events').models);
						day.get('timeSlots').models[i].get('events').remove(this);
						i++;
						if(! day.get('timeSlots').models[i]) {
								break;
						}
					}
					
					var children = this.get('children').models;
					for(var c in children){
						result = _.union(result, children[c].unbindTimeslots());
					}
					return result;
				}
				else{
					return [];
				}
			}
			else {
				return [];
			}
		}
	}
});

EventExtended = Event.extend({
	removeView: function() {
		this.unset('timeSlot_view');
		this.unset('daySlot_view');
	},
	remove: function() {
		this.get('super_model').unbind('change:color', this.setColor);
		this.get('view').remove();
	},
	bindTimeslots: function() {
		var plugin = $('.jqcal').data('plugin');
		var planning = $('.jqcal').data('planning');
		
		if(planning.get('format') == 'month' || planning.get('format') == 'custom_week'){
			var weeks = planning.get('weeks');
			
			if(! this.get('timeSlot_view')){
				var week = jqcal.time.inPlanning(this.get('starts_at'), this.get('ends_at'), planning, plugin);
			}
			else {
				var week = weeks.where({daySlots: this.get('daySlot_view').model.collection})[0]
			}
			
			if(!week) {
				return [];
			}
			else {
				var i = 0;
				while(this.get('ends_at') >= week.get('daySlots').models[i].get('ends_at')){
					week.get('daySlots').models[i].get('events').push(this);
					i++;
					if(! week.get('daySlots').models[i]) {
							break;
					}
				}
				return week;
			}
		}
		else {
			var days = planning.get('days');
			
			if(! this.get('timeSlot_view')){
				var day = jqcal.time.inPlanning(this.get('starts_at'), this.get('ends_at'), planning, plugin);
			}
			else {
				var day = days.where({timeSlots: this.get('timeSlot_view').model.collection})[0]
			}
			
			if(!day) {
				return -1;
			}
			else {
				var i = 0;
				var result1 = [];
				while(this.get('ends_at') >= day.get('timeSlots').models[i].get('ends_at')){
					day.get('timeSlots').models[i].get('events').push(this);
					result1 = _.union(result1, day.get('timeSlots').models[i].get('events').models);
					i++;
					if(! day.get('timeSlots').models[i]) {
							break;
					}
				}
				return day;
			}
		}
	},
	unbindTimeslots: function() {
		var plugin = $('.jqcal').data('plugin');
		var planning = $('.jqcal').data('planning');
		if(planning.get('format') == 'month' || planning.get('format') == 'custom_week'){
			var weeks = planning.get('weeks');
			if(this.get('daySlot_view')){
				var week = weeks.where({daySlots: this.get('daySlot_view').model.collection})[0];
				var i = 0;
				while(week.get('daySlots').models[i]){
					week.get('daySlots').models[i].get('events').remove(this);
					i++;
				}
				return week;
			}
			else {
				this.remove();
			}
		}
		else {
			var days = planning.get('days');
			if(this.get('timeSlot_view')){
				var day = days.where({timeSlots: this.get('timeSlot_view').model.collection})[0];
				var i = 0;
				while(day.get('timeSlots').models[i]){
					day.get('timeSlots').models[i].get('events').remove(this);
					i++;
				}
				return day;
			}
			else {
				this.remove();
			}
		}
	}	
});