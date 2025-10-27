import {fetchWeatherApi} from "openmeteo"
const params = {
	"latitude": 52.52,
	"longitude": 13.41,
	"daily": ["weather_code", "sunrise", "rain_sum", "wind_speed_10m_max", "uv_index_max", "precipitation_sum", "temperature_2m_max", "temperature_2m_min", "wind_direction_10m_dominant", "shortwave_radiation_sum", "precipitation_hours", "et0_fao_evapotranspiration"],
	"timezone": "Asia/Singapore",
};
const url = "https://api.open-meteo.com/v1/forecast";
const responses = await fetchWeatherApi(url, params);

// Process first location. Add a for-loop for multiple locations or weather models
const response = responses[0];

// Attributes for timezone and location
const latitude = response.latitude();
const longitude = response.longitude();
const elevation = response.elevation();
const utcOffsetSeconds = response.utcOffsetSeconds();

console.log(
	`\nCoordinates: ${latitude}°N ${longitude}°E`,
	`\nElevation: ${elevation}m asl`,
	`\nTimezone difference to GMT+0: ${utcOffsetSeconds}s`,
);

const daily = response.daily() ;

// Note: The order of weather variables in the URL query and the indices below need to match 
const weatherData = {
	daily: {
		time: [...Array((Number(daily.timeEnd()) - Number(daily.time())) / daily.interval())].map(
			(_, i) => new Date((Number(daily.time()) + i * daily.interval() + utcOffsetSeconds) * 1000)
		),
		temperature_2m: daily.variables(0) .valuesArray(),
		weather_code: daily.variables(1) .valuesArray(),
		relative_humidity_2m: daily.variables(2) .valuesArray(),
		soil_moisture_27_to_81cm: daily.variables(3) .valuesArray(),
		precipitation: daily.variables(4) .valuesArray(),
		precipitation_probability: daily.variables(5) .valuesArray(),
		wind_speed_10m: daily.variables(6) .valuesArray(),
		cloud_cover: daily.variables(7) .valuesArray(),
		visibility: daily.variables(8) .valuesArray(),
		wind_direction_10m: daily.variables(9) .valuesArray(),
		surface_pressure: daily.variables(10) .valuesArray(),
		pressure_msl: daily.variables(11) .valuesArray(),
		uv_index: daily.variables(12) .valuesArray(),
	},
};

console.log(weatherData.daily);
