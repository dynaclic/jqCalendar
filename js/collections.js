var Days = Backbone.Collection.extend({
	model: Day
});

var DaySlots = Backbone.Collection.extend({
	model : DaySlot
});

var TimeSlots = Backbone.Collection.extend({
	model : TimeSlot
});

var Agendas = Backbone.Collection.extend({
	model: Agenda
});

var Events = Backbone.Collection.extend({
	model: Event
});