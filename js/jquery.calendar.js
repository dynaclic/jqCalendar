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
				agenda_removed	: this.opt.agenda_removed
			});
			this.data('plugin', plugin);

			// instantiate the plugin's view
			var plugin_view = new PluginView({
				model: plugin,
				el: this
			});
			
			// instantiate the planning
			var starts_at = _.has(this.opt, 'starts_at') ? this.opt.starts_at : getToday(plugin.get('timezone_offset'));
			switch(this.opt.planning_format) {
				case 'day':
				case 'custom':
					starts_at = getDay(starts_at, plugin.get('timezone_offset'));
					break;
				case 'week':
					starts_at = getWeek(starts_at, plugin);
					break;
			}
			var planning = new Planning({
				format: this.opt.planning_format,
				nb_days: this.opt.nb_days,
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
					var nb_days_displayed = planning.get('days').models.length;
					var hours_width = $('#jqcal_hours').attr('hours_width');
					var calendar_size = Math.floor($('#jqcal_calendar').width()*95/100 - hours_width);
					var column_width = Math.floor(calendar_size/nb_days_displayed);
					var total_width = nb_days_displayed*column_width + 1;// table = tbody + 1 pour chrome et ff //
					
					var tableToChange = $('#jqcal_days, #jqcal_dayslots, #jqcal_timeslots');
					tableToChange.width(total_width);
					tableToChange.attr('column_width', column_width);
					
					// get the agendas collection
					var agendas = $('.jqcal').data('agendas');
					
					_.each(agendas.models, function(agenda) {
						if(agenda.get('display')) {
							_.each(agenda.get('events').models, function(event) {
								if(event.get('timeSlot_view') || event.get('daySlot_view')) {
									event.unbindTimeslots();
									event.get('view').render();
									event.bindTimeslots();
								}
							});
						}
					});
					
					planning.get('view').parse_each_day();
					planning.get('view').parse_full_day();
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
				
				$('.jqcal').data('planning').get('view').parse_full_day();
				$('.jqcal').data('planning').get('view').parse_each_day();
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
		timezone_offset	: getLocalTimezoneOffset(),
		first_day		: 0,
		planning_format	: 'week',
		hidden_days		: [],
		nb_days			: 3,
		event_created	: function(event) {return true;},
		event_changed	: function(event) {return true;},
		event_removed	: function(event) {return true;},
		agenda_created	: function(agenda) {return true;},
		agenda_changed	: function(agenda) {return true;},
		agenda_removed	: function(agenda) {return true;}
	};
	
})(jQuery);