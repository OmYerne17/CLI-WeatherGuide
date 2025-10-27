# 🌤️ Weather CLI Agent

A sophisticated **AI-powered weather forecast agent** that provides detailed weather analysis with intelligent safety precautions. Built with Node.js, OpenAI API, and Open-Meteo weather data.

## ✨ Features

- 🤖 **AI Agent Architecture**: Uses structured reasoning patterns to fetch and analyze weather data
- 🌍 **Universal City Support**: Automatically geocodes any city worldwide using ChatGPT
- 📊 **Comprehensive Weather Data**:
  - Temperature (min/max/average)
  - Precipitation and rainfall
  - UV Index analysis
  - Wind speed and direction
  - Weather conditions (clear, rain, snow, fog, etc.)
- 🛡️ **Smart Precautions**: AI-generated safety recommendations based on weather conditions
  - Heat protection (sunscreen, hydration)
  - Rain preparation (umbrella, waterproof gear)
  - Wind safety alerts
  - Fog visibility warnings
  - Cold weather advisories
- 🎯 **Multi-day Forecast**: Provides 3-day weather outlook
- 📝 **Readable Format**: Generates human-friendly paragraph-style reports

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- OpenAI API key (via OpenRouter)
- Open-Meteo API access

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd Agent

# Install dependencies
npm install
```

### Configuration

Update your OpenAI API key in `index.js`:

```javascript
const OpenAI_API_KEY = "your-api-key-here";
```

Or set it as an environment variable:

```bash
export OPENAI_API_KEY="your-api-key-here"
```

## 📖 Usage

Start the CLI agent:

```bash
node index.js
```

### Example Queries

```
>> what is weather of New York
>> weather forecast for Tokyo
>> tell me weather conditions in Mumbai
>> what's the weather like in London
```

### Sample Output

```
On Monday, January 15, the weather in New York will be partly cloudy 
with temperatures ranging from -5.0°C to 8.0°C (average: 1.5°C). 
Expect 2.5mm of precipitation and rain. The UV index is 3.2 (moderate). 
Wind speed will be around 25.4 km/h.

Precautions for this day: wear warm clothes, keep yourself warm, 
carry an umbrella or raincoat, wear waterproof shoes.
```

## 🏗️ Architecture

### Agent Reasoning Pattern

The agent follows a structured reasoning pattern:

1. **User Query** → Parse city name from input
2. **Geocoding** → Get coordinates via ChatGPT
3. **Weather Fetch** → Retrieve live data from Open-Meteo API
4. **Data Analysis** → Process temperature, rain, UV, wind
5. **Precaution Generation** → Generate safety recommendations
6. **Output Format** → Create human-readable paragraphs

### Technology Stack

- **Node.js**: Runtime environment
- **OpenAI API** (via OpenRouter): AI agent and geocoding
- **Open-Meteo SDK**: Live weather data fetching
- **Readline-Sync**: Interactive CLI interface

### Key Functions

#### `getCityCoordinates(cityName)`
- Uses ChatGPT to get latitude/longitude for any city
- Returns: `{ lat: number, lon: number }`

#### `getWeatherDetails(cityName)`
- Fetches comprehensive weather data using Open-Meteo API
- Returns structured JSON with 7-day forecast including:
  - Temperature (max/min)
  - Precipitation
  - UV Index
  - Wind speed
  - Weather codes

#### `formatWeatherParagraph(weatherDataStr)`
- Analyzes weather conditions
- Generates safety precautions based on:
  - Temperature thresholds
  - Rainfall predictions
  - UV index levels
  - Wind speed alerts
- Returns formatted paragraph with recommendations

## 🧠 How It Works

```
User Input → AI Agent → [Plan] → [Action] → [Observation] → [Output]

Example Flow:
"What is weather of Paris?"
    ↓
{"type": "plan", "plan": "I will fetch weather data for Paris"}
    ↓
{"type": "action", "function": "getWeatherDetails", "input": "Paris"}
    ↓
{"type": "observation", "observation": "Live weather data"}
    ↓
{"type": "action", "function": "analyzeWeatherAndPrecautions", "input": "weather data"}
    ↓
{"type": "output", "output": "Formatted paragraph with precautions"}
```

## 🌡️ Precautions Logic

The agent generates precautions based on:

- **Heat (>35°C)**: Hydration, sunscreen (SPF 50+)
- **Cold (<10°C)**: Warm clothes, staying warm
- **Rain**: Umbrella, raincoat, waterproof shoes
- **High UV (>7)**: Sunglasses, avoid peak hours, frequent sunscreen
- **Moderate UV (3-7)**: Basic sunscreen (SPF 30+)
- **Strong Winds (>40 km/h)**: Avoid outdoor activities, secure clothing
- **Fog**: Drive carefully, use low beam lights
- **Snow**: Non-slip shoes

## 📦 Dependencies

```json
{
  "openai": "^6.6.0",
  "openmeteo": "^1.2.1",
  "readline-sync": "^1.4.10"
}
```

## 🛠️ Development

### Project Structure

```
Agent/
├── index.js          # Main application file
├── package.json       # Dependencies
└── README.md         # This file
```

### Extending the Agent

To add new weather parameters:

1. Update the `daily` array in `getWeatherDetails()`:
```javascript
"daily": [
  "weather_code",
  "temperature_2m_max",
  "your_new_parameter"
]
```

2. Add the variable parsing:
```javascript
your_new_parameter: daily.variables(X).valuesArray()
```

3. Update `formatWeatherParagraph()` to handle the new parameter

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

ISC License

## 🙏 Acknowledgments

- Open-Meteo for weather data API
- OpenAI for AI capabilities
- OpenRouter for API access

## ⚠️ Disclaimer

This is a personal project for educational purposes. The weather data and AI-generated precautions should not be the sole basis for critical weather-dependent decisions.

---

Made with ❤️ using Node.js, OpenAI, and Open-Meteo

