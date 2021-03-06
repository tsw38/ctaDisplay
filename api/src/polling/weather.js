const axios = require('axios');
const convert = require('convert-units');

const ENDPOINTS = require('../endpoints');
const {database} = require('../../firebase/config');

const getWeather = async () => {
	try {
		const {status, data: {
			sys,
			main,
			weather
		}} = await axios.get(ENDPOINTS.getWeather());

		var ref = database.ref("weather");

		if (status === 200 && sys && main && weather) {
			ref.set({
				sunset: sys.sunset*1000,
				humidity: main.humidity,
				sunrise: sys.sunrise*1000,
				low: Math.floor(convert(main.temp_min).from('K').to('F')),
				high: Math.floor(convert(main.temp_max).from('K').to('F')),
				temperature: Math.floor(convert(main.temp).from('K').to('F')),
				condition: weather.map(({main}) => main).sort().join('-').toLowerCase()
			});
			// TODO: SAFE, non memory hogging log
		}
	} catch ({message, ...rest}) {
		// TODO: SAFE, non memory hogging log
	}
}

const execute = () => {
	getWeather();
	setInterval(getWeather, process.env.POLLING_WEATHER);
}


module.exports = execute;