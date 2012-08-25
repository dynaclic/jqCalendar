;
var jqcal = new function() {
	this.dates = {
		shortDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
		days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
		minDays: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
		months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
		shortMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
	};
	this.colors = ['ffffff', 'ffccc9', 'ffce93', 'fffc9e', 'ffffc7', '9aff99', '96fffb', 'cdffff', 'cbcefb', 'cfcfcf', 'fd6864', 'fe996b', 'fffe65', 'fcff2f', '67fd9a', '38fff8', '68fdff', '9698ed', 'c0c0c0', 'fe0000', 'f8a102', 'ffcc67', 'f8ff00', '34ff34', '68cbd0', '34cdf9', '6665cd', '9b9b9b', 'cb0000', 'f56b00', 'ffcb2f', 'ffc702', '32cb00', '00d2cb', '3166ff', '6434fc', '656565', '9a0000', 'ce6301', 'cd9934', '999903', '009901', '329a9d', '3531ff', '6200c9', '343434', '680100', '963400', '986536', '646809', '036400', '34696d', '00009b', '303498', '000000', '330001', '643403', '663234', '343300', '013300', '003532', '010066', '640096'];
	this.agenda = [];
	this.event = [];
	this.time = {
		// get local timezone offset
		getLocalTimezoneOffset: function() {
			return (new Date).getTimezoneOffset();
		},

		// get today's timestamp in the given offset
		// eg:
		// offset = -120 && date = 2012/07/27 23:00:00 UTC
		// shall return timestamp for 2012/07/28 00:00:00 GMT+2 (2012/07/27 22:00:00 UTC)
		getToday: function(offset) {
			var timestamp = $.now() - offset * 60000;
			return (timestamp - timestamp%(86400000)) + offset * 60000; // 60000ms = 1min && 86400000ms = 24*60*60*1000ms = 1d
		},

		// get day's timestamp in the given offset
		// eg:
		// offset = -120 && timestamp for 2012/07/27 10:00:00 GMT+2 (2012/07/27 08:00:00 UTC)
		// shall return timestamp for 2012/07/27 00:00:00 GMT+2 (2012/07/26 22:00:00 UTC)
		getDay: function(timestamp, offset) {
			return ((timestamp - offset * 60000) - (timestamp - offset * 60000)%(86400000)) + offset * 60000; // 60000ms = 1min && 86400000ms = 24*60*60*1000ms = 1d
		},

		// get day's week's timestamp for the given offset and the given first day of the week
		// eg:
		// offset = -120 && timestamp for 2012/07/31 11:30:00 GMT+2 (tuesday) (2012/07/31 09:30:00 UTC)
		// shall return timestamp for 2012/07/30 00:00:00 GMT+2 (2012/07/29 22:00:00 UTC)
		getWeek: function(timestamp, plugin) {
			return jqcal.time.addDays(jqcal.time.getDay(timestamp, plugin.get('timezone_offset')), -((((jqcal.time.timestampToDay(timestamp, plugin.get('timezone_offset')) - plugin.get('first_day'))%7)+7)%7)); // (-n)%7 = -(n%7) => ((-n)%7+7)%7 = n%7
		},

		// get day's month's timestamp for the given offset and the given first day of the week
		// eg:
		// offset = -120 && timestamp for 2012/08/22 11:30:00 GMT+2 (wednesday) (2012/07/31 09:30:00 UTC)
		// shall return timestamp for 2012/07/30 00:00:00 GMT+2 (2012/07/29 22:00:00 UTC)
		getMonth: function(timestamp, plugin) {
			var date = new Date(timestamp);
			date.setDate(1);
			return jqcal.time.addDays(date.getTime(), (plugin.get('first_day') - date.getDay() + 6)%7 - 6);
		},
		
		// add n years to the specified timestamp (here we use the Date object to avoid dealing with leap years)
		addYears: function(timestamp, n) {
			var date = new Date(timestamp);
			date.setFullYear(date.getFullYear()+n);
			return date.getTime();
		},

		// add n months to the specified timestamp
		addMonths: function(timestamp, n) {
			var date = new Date(timestamp);
			date.setMonth(date.getMonth()+n);
			return date.getTime();
		},

		// retrieve the k-th day of the week in n months
		getNthDay: function(timestamp, n) {
			var date = new Date(timestamp);
			var day = date.getDay();
			var k = Math.ceil(date.getDate() / 7);
			date.setDate(1);
			date.setMonth(date.getMonth()+n);
			date.setDate((day - date.getDay() + 7)%7 + 1 + (k-1) * 7);
			return date.getTime();
		},

		// add n days to the specified timestamp
		addDays: function(timestamp, n) {
			return timestamp + n*86400000; // 86400000ms = 24*60*60*1000ms = 1d
		},

		// add n hours to the specified timestamp
		addHours: function(timestamp, n) {
			return timestamp + n*3600000; // 3600000ms = 60*60*1000ms = 1h
		},

		// convert a timestamp to a date (format: yyyy/mm/dd)
		timestampToDate: function(timestamp, offset) {
			date = new Date(timestamp - offset * 60000);
			return date.getUTCFullYear()+'/'+(date.getUTCMonth()+1)+'/'+date.getUTCDate();
		},

		// convert a timestamp to a day (format: d?d)
		timestampToMonthDay: function(timestamp, offset) {
			return (new Date(timestamp - offset * 60000)).getUTCDate();
		},
		
		// convert a timestamp to a time (format: hh:mm)
		timestampToTime: function(timestamp, offset) {
			date = new Date(timestamp - offset * 60000); // 60000ms = 1min
			//return date.getUTCHours()+':'+date.getUTCMinutes();
			return new Array(3 - date.getUTCHours().toString().length).join('0') + date.getUTCHours().toString() + ':' + new Array(3 - date.getUTCMinutes().toString().length).join('0') + date.getUTCMinutes().toString();
		},

		// convert a timestamp to the day of the week (format: 0-6)
		timestampToDay: function(timestamp, offset) {
			date = new Date(timestamp - offset * 60000);
			return date.getUTCDay();
		},

		// convert a timestamp to a string in the specified format
		timestampToFormat: function(timestamp, offset, format) {
			var string = '';
			var date = new Date(timestamp - offset * 60000);
			var replaceBy = {
				d: new Array(3-date.getUTCDate().toString().length).join('0')+date.getUTCDate().toString(),
				D: jqcal.dates.shortDays[date.getUTCDay()],
				j: date.getUTCDate(),
				l: jqcal.dates.days[date.getUTCDay()],
				N: (date.getUTCDay()+6)%7 + 1,
				w: date.getUTCDay(),
				F: jqcal.dates.months[date.getUTCMonth()],
				m: new Array(3-(date.getUTCMonth()+1).toString().length).join('0')+(date.getUTCMonth()+1).toString(),
				M: jqcal.dates.shortMonths[date.getUTCMonth()],
				n: date.getUTCMonth()+1,
				Y: date.getUTCFullYear(),
				y: date.getUTCFullYear().toString().substr(2,2)
			};
			for(var i=0; i<format.length; i++) {
				if(_.has(replaceBy, format.charAt(i))) {
					string += replaceBy[format.charAt(i)];
				}
				else {
					string += format.charAt(i);
				}
			}
			return string;
		},

		// return true if the event is to be displayed, false otherwise
		inPlanning: function(starts_at, ends_at, planning, plugin) {
			switch(planning.get('format')){
				case 'day': 
				case 'custom_day':
				case 'week':
					var model = null;
					var days = planning.get('days').models;
					var nb_timeSlots = (plugin.get('day_ends_at') - plugin.get('day_starts_at')) / plugin.get('day_fraction');
					for(var day in days) {
						if((starts_at >= days[day].get('timeSlots').models[0].get('starts_at') && starts_at < days[day].get('timeSlots').models[nb_timeSlots - 1].get('ends_at'))
						|| (ends_at > days[day].get('timeSlots').models[0].get('starts_at') && ends_at <= days[day].get('timeSlots').models[nb_timeSlots - 1].get('ends_at'))
						|| (starts_at <= days[day].get('timeSlots').models[0].get('starts_at') && ends_at >= days[day].get('timeSlots').models[nb_timeSlots - 1].get('ends_at'))){
							model = days[day];
							break;
						}
					}
					return model;
				case 'custom_week':
				case 'month':
					var model = null;
					var weeks = planning.get('weeks').models;
					for(var week in weeks) {
						if((starts_at >= weeks[week].get('daySlots').models[0].get('starts_at') && starts_at < weeks[week].get('daySlots').models[6].get('ends_at'))
						|| (ends_at > weeks[week].get('daySlots').models[0].get('starts_at') && ends_at <= weeks[week].get('daySlots').models[6].get('ends_at'))
						|| (starts_at <= weeks[week].get('daySlots').models[0].get('starts_at') && ends_at >= weeks[week].get('daySlots').models[6].get('ends_at'))){
							model = weeks[week];
							break;
						}
					}
					return model;
			}
		}
	};
};

(function($) {

	var methods = {
		init: function(settings) {
			this.opt = $.extend(true, {}, $.fn.jqcal.defaults, settings);
			
			// compile the templates
			for(var template in jqcal.templates) {
				jqcal.templates[template] = Handlebars.compile(jqcal.templates[template]);
			}
			
			// instantiate the agenda collection
			this.data('agendas', new Agendas(new Agenda));
			
			// instantiate the plugin
			var plugin = new Plugin({
				no_perm_agenda	: this.opt.no_perm_agenda,
				no_perm_event	: this.opt.no_perm_event,
				edit_dialog		: this.opt.edit_dialog,
				calendar_ends_at: this.opt.calendar_ends_at,
				date_format		: this.opt.date_format,
				day_starts_at	: this.opt.day_starts_at,
				day_ends_at		: this.opt.day_ends_at,
				day_fraction	: this.opt.day_fraction,
				timezone_offset	: this.opt.timezone_offset,
				first_day		: this.opt.first_day,
				hidden_days		: this.opt.hidden_days,
				event_created	: this.opt.event_created,
				event_changed	: this.opt.event_changed,
				event_removed	: this.opt.event_removed,
				agenda_created	: this.opt.agenda_created,
				agenda_changed	: this.opt.agenda_changed,
				agenda_removed	: this.opt.agenda_removed,
				event_init_event: this.opt.event_init_event,
				event_stop_event: this.opt.event_stop_event,
				period_changed	: this.opt.period_changed
			});
			this.data('plugin', plugin);

			// instantiate the plugin's view
			var plugin_view = new PluginView({
				model: plugin,
				el: this
			});
			
			// instantiate the planning
			var starts_at = _.has(this.opt, 'starts_at') ? this.opt.starts_at : jqcal.time.getToday(plugin.get('timezone_offset'));
			switch(this.opt.planning_format) {
				case 'day':
				case 'custom_day':
					starts_at = jqcal.time.getDay(starts_at, plugin.get('timezone_offset'));
					break;
				case 'week':
					starts_at = jqcal.time.getWeek(starts_at, plugin);
					break;
				case 'month':
					starts_at = jqcal.time.getMonth(starts_at, plugin);
			}
			var planning = new Planning({
				format: this.opt.planning_format,
				nb_days: this.opt.nb_days,
				nb_weeks: this.opt.nb_weeks,
				starts_at: starts_at
			});
			this.data('planning', planning);
			
			// instantiate the planning's view
			var planning_view = new PlanningView({
				el: $('#jqcal_calendar'),
				model: planning
			});
			
			// show the default agenda
			new  AgendaView({
				model: this.data('agendas').models[0]
			});
			
			$(window).resize(function(e) {
				if(e.target == window) { // jquery bug: http://bugs.jqueryui.com/ticket/7514
				
					plugin.removeDialogs();
					if(planning.get('format') == 'month' || planning.get('format') == 'custom_week'){
						var calendar_size = Math.floor($('#jqcal_calendar').width()*96/100);
						var column_width = Math.floor(calendar_size/7);
						var total_width = 7*column_width + 1;
						var tableToChange = $('#jqcal_days, #jqcal_dayslots');
						tableToChange.width(total_width);
						tableToChange.attr('column_width', column_width);
						
						// get the agendas collection
						var agendas = $('.jqcal').data('agendas');
						
						_.each(agendas.models, function(agenda) {
							if(agenda.get('display')) {
								_.each(agenda.get('events').models, function(event) {
									if(event.get('daySlot_view')) {
										event.unbindTimeslots();
										event.get('view').render();
										event.bindTimeslots();
									}
								});
							}
						});
						
						planning.get('view').parse_each_week();
					}
					else {
						var nb_days_displayed = planning.get('days').models.length;
						var hours_width = $('#jqcal_hours').attr('hours_width');
						var calendar_size = Math.floor($('#jqcal_calendar').width()*95/100 - hours_width);
						var column_width = Math.floor(calendar_size/nb_days_displayed);
						var total_width = nb_days_displayed*column_width + 1;// table = tbody + 1 pour chrome et ff //
						
						var tableToChange = $('#jqcal_days, #jqcal_fulltimeslots, #jqcal_timeslots');
						tableToChange.width(total_width);
						tableToChange.attr('column_width', column_width);
						
						// get the agendas collection
						var agendas = $('.jqcal').data('agendas');
						
						_.each(agendas.models, function(agenda) {
							if(agenda.get('display')) {
								_.each(agenda.get('events').models, function(event) {
									if(event.get('timeSlot_view') || event.get('fullTimeSlot_view')) {
										event.unbindTimeslots();
										event.get('view').render();
										event.bindTimeslots();
									}
								});
							}
						});
						
						planning.get('view').parse_full_day();
						planning.get('view').parse_each_day();
					}
				}
			});
			
			return this;
		},
		add: function(agendas) {
			// get the existing agendas
			var collection = $('.jqcal').data('agendas');
		
			_.each(agendas, function(agenda) {
				// create the agenda if it doesn't exist yet
				if(collection.where({label: agenda['label']}).length == 0) {
					// remove the default agenda if it's empty
					if((collection.length == 1) && (collection.models[0].get('label') == 'default') && (collection.models[0].get('events').length == 0)) {
						collection.pop().get('view').remove();
					}
					
					// instantiate the new agenda
					if(!collection.where({label: agenda.label}).length) {
						var new_agenda = new Agenda(agenda);
						if(!_.has(agenda, 'color')) {
							new_agenda.set('color', '#'+(function(h){return new Array(7-h.length).join("0")+h})((Math.random()*(0xFFFFFF+1)<<0).toString(16)));
						}
						
						// push it
						collection.push(new_agenda);
						
						// instantiate the agenda's view
						new AgendaView({
							model: new_agenda
						});
					}
				}
				
				// add the events
				_.each(agenda['events'], function(event) {
					var event = new Event(_.extend(event, {agenda: agenda['label']}));
					
					var event_view = new EventView({
						model: event
					});
					event.bindTimeslots();
				});
				var planning = $('.jqcal').data('planning');
				if(planning.get('format') == 'month' || planning.get('format') == 'custom_week'){
					planning.get('view').parse_each_weeks();
				}
				else {
					planning.get('view').parse_full_day();
					planning.get('view').parse_each_day();
				}
			});

			return this;
		},
		bindIdsToCids: function(ids) {
			// get the agendas
			var agendas = $('.jqcal').data('agendas');
			_.each(ids, function(id, cid) {
				var model;
				if(model = agendas.getByCid(cid)) {
					model.set('id', id);
				}
				else {
					for(var i = 0; i < agendas.length; i++) {
						if(model = agendas.models[i].get('events').getByCid(cid)) {
							model.set('id', id);
							break;
						}
					}
				}
			});
			return this;
		},
		changeByIds: function(ids) {
			var agendas = $('.jqcal').data('agendas');
			_.each(ids, function(values, id) {
				var model;
				if(model = agendas.get(id)) {
					model.set(values, {silent: true});
				}
				else {
					for(var i = 0; i < agendas.length; i++) {
						if(model = agendas.models[i].get('events').get(id)) {
							model.set(values, {silent: true});
							break;
						}
					}
				}
			});
		},
		changeByCids: function(cids) {
			var agendas = $('.jqcal').data('agendas');
			_.each(cids, function(values, cid) {
				var model;
				if(model = agendas.getByCid(cid)) {
					model.set(values);
				}
				else {
					for(var i = 0; i < agendas.length; i++) {
						if(model = agendas.models[i].get('events').getByCid(cid)) {
							model.set(values);
							break;
						}
					}
				}
			});
		},
		removeByIds: function(ids) {
			var agendas = $('.jqcal').data('agendas');
			_.each(ids, function(id) {
				var model;
				if(model = agendas.get(id)) {
					model.remove();
				}
				else {
					for(var i = 0; i < agendas.length; i++) {
						if(model = agendas.models[i].get('events').get(id)) {
							model.remove();
							break;
						}
					}
				}
			});
			return this;
		},
		removeByCids: function(cids) {
			var agendas = $('.jqcal').data('agendas');
			_.each(cids, function(cid) {
				var model;
				if(model = agendas.getByCid(cid)) {
					model.remove();
				}
				else {
					for(var i = 0; i < agendas.length; i++) {
						if(model = agendas.models[i].get('events').getByCid(cid)) {
							model.remove();
							break;
						}
					}
				}
			});
			return this;
		}
	};
	
	$.fn.jqcal = function(method) {
		if (methods[method]) {
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === 'object' || !method) {
			return methods.init.apply(this, arguments);
		} else {
			$.error('Method ' + method + ' does not exist!');
		}
	};

	// default values for the plugin and the planning
	$.fn.jqcal.defaults = {
		no_perm_agenda	: [],
		no_perm_event	: [],
		edit_dialog		: true,
		date_format		: 'Y-m-d',
		calendar_ends_at: $.now() + 3*365*24*60*60*1000,
		day_starts_at	: 0,
		day_ends_at		: 24,
		day_fraction	: 0.5,
		timezone_offset	: jqcal.time.getLocalTimezoneOffset(),
		first_day		: 0,
		planning_format	: 'week',
		hidden_days		: [],
		nb_days			: 3,
		nb_weeks		: 3,
		event_created	: function(event) {return true;},
		event_changed	: function(event) {return true;},
		event_removed	: function(event) {return true;},
		agenda_created	: function(agenda) {return true;},
		agenda_changed	: function(agenda) {return true;},
		agenda_removed	: function(agenda) {return true;},
		event_init_event: function(event, action) {return true;},
		event_stop_event: function(event, action) {return true;},
		period_changed	: function(starts_at, ends_at) {return true;}
	};
	
})(jQuery);