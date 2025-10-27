import OpenAI from "openai";
import readlineSync from "readline-sync";
import { fetchWeatherApi } from "openmeteo";
const OpenAI_API_KEY =
  "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";

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: OpenAI_API_KEY,
});

async function getCityCoordinates(cityName) {
  try {
    const geoPrompt = `You are a geocoding assistant. When given a city name, return ONLY the latitude and longitude in JSON format: {"lat": <number>, "lon": <number>}. For the city: ${cityName}`;
    
    const response = await client.chat.completions.create({
      model: "openai/gpt-4o-mini",
      messages: [{ role: "user", content: geoPrompt }],
    });
    
    const content = response.choices[0].message.content;
    const coords = JSON.parse(content.trim());
    return coords;
  } catch (error) {
    throw new Error(`Failed to get coordinates for ${cityName}: ${error.message}`);
  }
}

async function getWeatherDetails(cityName) {
  try {
    // Step 1: Get coordinates from ChatGPT
    const coords = await getCityCoordinates(cityName);
    
    if (!coords.lat || !coords.lon) {
      return JSON.stringify({ error: `Failed to get coordinates for ${cityName}` });
    }

    console.log(`📍 Fetching weather for ${cityName} at ${coords.lat}, ${coords.lon}`);
    
    // Step 2: Fetch daily weather forecast from open-meteo API using openmeteo SDK
    const params = {
      "latitude": coords.lat,
      "longitude": coords.lon,
      "daily": [
        "weather_code",
        "sunrise",
        "rain_sum",
        "wind_speed_10m_max",
        "uv_index_max",
        "precipitation_sum",
        "temperature_2m_max",
        "temperature_2m_min",
        "wind_direction_10m_dominant",
        "shortwave_radiation_sum",
        "precipitation_hours",
        "et0_fao_evapotranspiration"
      ],
      "timezone": "Asia/Kolkata",
    };
    
    const url = "https://api.open-meteo.com/v1/forecast";
    const responses = await fetchWeatherApi(url, params);
    
    // Process first location
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
    
    const daily = response.daily();
    
    // Note: The order of weather variables in the URL query and the indices below need to match
    // Order: weather_code(0), sunrise(1), rain_sum(2), wind_speed(3), uv_index(4), 
    // precipitation(5), temp_max(6), temp_min(7), wind_dir(8), radiation(9), 
    // prec_hours(10), et0(11)
    const weatherData = {
      city: cityName,
      latitude,
      longitude,
      timezone: "Asia/Kolkata",
      daily: {
        time: [...Array((Number(daily.timeEnd()) - Number(daily.time())) / daily.interval())].map(
          (_, i) => new Date((Number(daily.time()) + i * daily.interval() + utcOffsetSeconds) * 1000)
        ),
        weather_code: daily.variables(0).valuesArray(),
        sunrise: daily.variables(1).valuesArray(),
        rain_sum: daily.variables(2).valuesArray(),
        wind_speed_10m_max: daily.variables(3).valuesArray(),
        uv_index_max: daily.variables(4).valuesArray(),
        precipitation_sum: daily.variables(5).valuesArray(),
        temperature_2m_max: daily.variables(6).valuesArray(),
        temperature_2m_min: daily.variables(7).valuesArray(),
      }
    };
    console.log("-------------------------weatherData------------------------ \n\n",(weatherData));
    return JSON.stringify(weatherData);
  } catch (error) {
    return JSON.stringify({ error: `Error fetching weather: ${error.message}` });
  }
}
 
function formatWeatherParagraph(weatherDataStr) {
  try {
    const weatherData = JSON.parse(weatherDataStr);
    
    if (weatherData.error) {
      return weatherData.error;
    }
    
    const daily = weatherData.daily;
    let paragraphs = [];
    
    for (let i = 0; i < daily.time.length && i < 3; i++) { // Analyze next 3 days
      const date = new Date(daily.time[i]);
      const tempMax = daily.temperature_2m_max[i];
      const tempMin = daily.temperature_2m_min[i];
      const precipitation = daily.precipitation_sum[i];
      const rainSum = daily.rain_sum[i];
      const uvIndex = daily.uv_index_max[i];
      const windSpeed = daily.wind_speed_10m_max[i];
      const weatherCode = daily.weather_code[i];
      
      const precautions = [];
      
      // Temperature checks
      if (tempMax > 35) {
        precautions.push('stay hydrated and avoid prolonged outdoor activities');
        precautions.push('use sunscreen (SPF 50+) as UV index is high');
      } else if (tempMin < 10) {
        precautions.push('wear warm clothes');
        precautions.push('keep yourself warm');
      }
      
      // Rain checks
      if (precipitation > 0 || rainSum > 0) {
        precautions.push('carry an umbrella or raincoat');
        precautions.push('wear waterproof shoes');
      }
      
      // UV index checks
      if (uvIndex > 7) {
        precautions.push('wear sunglasses and avoid sun during peak hours (10 AM - 4 PM)');
        precautions.push('apply sunscreen liberally and reapply every 2 hours');
      } else if (uvIndex > 3) {
        precautions.push('use sunscreen (SPF 30+)');
      }
      
      // Wind checks
      if (windSpeed > 40) {
        precautions.push('strong winds expected - avoid outdoor activities');
        precautions.push('secure loose clothing');
      }
      
      // Weather code interpretation (WMO weather codes)
      let weatherCondition = 'Clear skies';
      if (weatherCode >= 1 && weatherCode <= 3) {
        weatherCondition = 'Partly cloudy';
      } else if (weatherCode >= 45 && weatherCode <= 49) {
        weatherCondition = 'Foggy';
        precautions.push('drive carefully, use low beam lights');
      } else if (weatherCode >= 50 && weatherCode <= 69) {
        weatherCondition = 'Rainy';
      } else if (weatherCode >= 70 && weatherCode <= 79) {
        weatherCondition = 'Snowy';
        precautions.push('wear non-slip shoes');
      } else if (weatherCode >= 80 && weatherCode <= 99) {
        weatherCondition = 'Rain showers';
      } else if (weatherCode >= 61 && weatherCode <= 67) {
        weatherCondition = 'Moderate to heavy rain';
      } else if (weatherCode >= 71 && weatherCode <= 77) {
        weatherCondition = 'Snowy';
        precautions.push('wear non-slip shoes');
      }
      
      const dateStr = date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
      const avgTemp = ((tempMax + tempMin) / 2).toFixed(1);
      
      let para = `On ${dateStr}, the weather in ${weatherData.city} will be ${weatherCondition.toLowerCase()} with temperatures ranging from ${tempMin.toFixed(1)}°C to ${tempMax.toFixed(1)}°C (average: ${avgTemp}°C). `;
      
      if (precipitation > 0 || rainSum > 0) {
        const totalRain = (precipitation + rainSum).toFixed(1);
        para += `Expect ${totalRain}mm of precipitation and rain. `;
      }
      
      if (uvIndex > 0) {
        const uvLevel = uvIndex > 7 ? 'very high' : uvIndex > 3 ? 'moderate' : 'low';
        para += `The UV index is ${uvIndex.toFixed(1)} (${uvLevel}). `;
      }
      
      if (windSpeed > 0) {
        para += `Wind speed will be around ${windSpeed.toFixed(1)} km/h. `;
      }
      
      if (precautions.length > 0) {
        para += `\n\nPrecautions for this day: `;
        para += precautions.map((p, idx) => 
          idx === precautions.length - 1 ? p : p + ', '
        ).join('') + '.';
      } else {
        para += `\n\nIt will be pleasant weather, enjoy your day!`;
      }
      
      paragraphs.push(para);
    }
    
    return paragraphs.join('\n\n');
  } catch (error) {
    return `Error analyzing weather: ${error.message}`;
  }
}

const tools = {
  'getWeatherDetails': getWeatherDetails,
  'analyzeWeatherAndPrecautions': formatWeatherParagraph,
}

const SYSTEM_PROMPT = `You are a weather advisory agent that provides detailed weather forecasts with safety precautions.

Your goal is to:
1. Get weather data for the city using getWeatherDetails
2. Format and analyze the weather data using analyzeWeatherAndPrecautions
3. Present the results directly as formatted paragraphs

Follow this exact reasoning pattern:

1. Start with:
   {"type": "user", "user": "<user query>"}

2. Create a plan:
   {"type": "plan", "plan": "I will fetch weather data for <city> and format it with precautions"}

3. Get weather data:
   {"type": "action", "function": "getWeatherDetails", "input": "<city name>"}
   After receiving: {"type": "observation", "observation": "<weather json data>"}

4. Format weather with precautions:
   {"type": "plan", "plan": "I will format the weather data into readable paragraphs with precautions"}
   {"type": "action", "function": "analyzeWeatherAndPrecautions", "input": "<weather json data from previous observation>"}
   After receiving: {"type": "observation", "observation": "<formatted paragraph>"}

5. Produce final output (just output the formatted paragraph as-is):
   {"type": "output", "output": "<the formatted paragraph from observation>"}

Always output JSON steps. Do not skip steps.

Available functions:
- getWeatherDetails(city): Returns daily weather forecast JSON for the city
- analyzeWeatherAndPrecautions(weatherJSON): Returns formatted paragraph with temperature, precipitation, UV index, wind speed, and precautions
`;

while (true) {
  const message = [{ role: "system", content: SYSTEM_PROMPT }];
  const query = readlineSync.question(">>");

  message.push({ role: "user", content: query });

  while (true) {
    const completion = await client.chat.completions.create({
      model: "openai/gpt-4o-mini",
      messages: message,
      // response_format: {type: 'json_object'},  
  });
  const result = completion.choices[0].message.content;
  message.push({role: 'assistant', content:result});
  
  console.log('--------------AI Response-----------------\n\n');
  console.log(result);
  
  // Extract all JSON objects from the response
  const lines = result.trim().split('\n');
  const jsonLines = lines.filter(line => line.trim().startsWith('{')).map(line => {
    try {
      return JSON.parse(line.trim());
    } catch (e) {
      return null;
    }
  }).filter(obj => obj !== null);
  
  // Get the last valid JSON object
  const call = jsonLines[jsonLines.length - 1];
  console.log("Parsed call result:",call)

  if (!call) {
    console.log("No valid JSON found in response, continuing...");
    continue;
  }

  if (call.type === 'output'){
    console.log(`🤖: ${call.output}`);
    break;
  } else if (call.type === 'action') {
    if (!tools[call.function]) {
      console.log(`Function ${call.function} not found`);
      continue;
    }
    const fn = tools[call.function];
    const observation = await fn(call.input);
    const obs = {type: 'observation', observation: observation};
    message.push({role: 'user', content: JSON.stringify(obs)});
  } else if (call.type === 'plan' || call.type === 'observation' || call.type === 'user') {
    // Just continue, these don't need action
    continue;
  } else {
    console.log(`Unknown call type: ${call.type}`);
    continue;
  }
  }
}
