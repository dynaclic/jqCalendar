var Days = Backbone.Collection.extend({
	model: Day
});

var FullTimeSlots = Backbone.Collection.extend({
	model : FullTimeSlot
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