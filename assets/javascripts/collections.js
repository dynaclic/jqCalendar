var Days = Backbone.Collection.extend({
	model: Day
});

var FullTimeSlots = Backbone.Collection.extend({
	model : FullTimeSlot
});

var TimeSlots = Backbone.Collection.extend({
	model : TimeSlot
});

var Weeks = Backbone.Collection.extend({
	model : Week
});

var DaySlots = Backbone.Collection.extend({
	model : DaySlot
});

var Agendas = Backbone.Collection.extend({
	model: Agenda
});

var Events = Backbone.Collection.extend({
	model: Event
});