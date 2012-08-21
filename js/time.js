// stores time/date relative functions

// get local timezone offset
function getLocalTimezoneOffset() {
	return (new Date).getTimezoneOffset();
}

// get today's timestamp in the given offset
// eg:
// offset = -120 && date = 2012/07/27 23:00:00 UTC
// shall return timestamp for 2012/07/28 00:00:00 GMT+2 (2012/07/27 22:00:00 UTC)
function getToday(offset) {
	var timestamp = $.now() - offset * 60000;
	return (timestamp - timestamp%(86400000)) + offset * 60000; // 60000ms = 1min && 86400000ms = 24*60*60*1000ms = 1d
}

// get day's timestamp in the given offset
// eg:
// offset = -120 && timestamp for 2012/07/27 10:00:00 GMT+2 (2012/07/27 08:00:00 UTC)
// shall return timestamp for 2012/07/27 00:00:00 GMT+2 (2012/07/26 22:00:00 UTC)
function getDay(timestamp, offset) {
	return ((timestamp - offset * 60000) - (timestamp - offset * 60000)%(86400000)) + offset * 60000; // 60000ms = 1min && 86400000ms = 24*60*60*1000ms = 1d
}

// get day's week's timestamp for the given offset and the given first day of the week
// eg:
// offset = -120 && timestamp for 2012/07/31 11:30:00 GMT+2 (tuesday) (2012/07/31 09:30:00 UTC)
// shall return timestamp for 2012/07/30 00:00:00 GMT+2 (2012/07/29 22:00:00 UTC)
function getWeek(timestamp, plugin) {
	return addDays(getDay(timestamp, plugin.get('timezone_offset')), -((((timestampToDay(timestamp, plugin.get('timezone_offset')) - plugin.get('first_day'))%7)+7)%7)); // (-n)%7 = -(n%7) => ((-n)%7+7)%7 = n%7
}

// add n years to the specified timestamp (here we use the Date object to avoid dealing with leap years)
function addYears(timestamp, n) {
	var date = new Date(timestamp);
	date.setFullYear(date.getFullYear()+n);
	return date.getTime();
}

// add n months to the specified timestamp
function addMonths(timestamp, n) {
	var date = new Date(timestamp);
	date.setMonth(date.getMonth()+n);
	return date.getTime();
}

// retrieve the k-th day of the week in n months
function getNthDay(timestamp, n) {
	var date = new Date(timestamp);
	var day = date.getDay();
	var k = Math.ceil(date.getDate() / 7);
	date.setDate(1);
	date.setMonth(date.getMonth()+n);
	date.setDate((day - date.getDay() + 7)%7 + 1 + (k-1) * 7);
	return date.getTime();
}

// add n days to the specified timestamp
function addDays(timestamp, n) {
	return timestamp + n*86400000; // 86400000ms = 24*60*60*1000ms = 1d
}

// add n hours to the specified timestamp
function addHours(timestamp, n) {
	return timestamp + n*3600000; // 3600000ms = 60*60*1000ms = 1h
}

// convert a timestamp to a date (format: yyyy/mm/dd)
function timestampToDate(timestamp, offset) {
	date = new Date(timestamp - offset * 60000);
	return date.getUTCFullYear()+'/'+(date.getUTCMonth()+1)+'/'+date.getUTCDate();
}

// convert a timestamp to a time (format: hh:mm)
function timestampToTime(timestamp, offset) {
	date = new Date(timestamp - offset * 60000); // 60000ms = 1min
	//return date.getUTCHours()+':'+date.getUTCMinutes();
	return new Array(3 - date.getUTCHours().toString().length).join('0') + date.getUTCHours().toString() + ':' + new Array(3 - date.getUTCMinutes().toString().length).join('0') + date.getUTCMinutes().toString();
}

// convert a timestamp to the day of the week (format: 0-6)
function timestampToDay(timestamp, offset) {
	date = new Date(timestamp - offset * 60000);
	return date.getUTCDay();
}

// convert a timestamp to a string in the specified format
function timestampToFormat(timestamp, offset, format) {
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
}

// return true if the two timestamps represent the same day, false otherwise
function sameDay(timestamp1, timestamp2, offset) {
	return getDay(timestamp1, offset) == getDay(timestamp2, offset);
}

// return true if the event is to be displayed, false otherwise
function inPlanning(starts_at, ends_at, planning, plugin) {
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
}