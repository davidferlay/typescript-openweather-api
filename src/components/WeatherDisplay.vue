<template>
  <div>
    <h2>Weather in {{ city }}</h2>
    <input v-model="city" placeholder="Enter a city" />
    <button @click="loadWeather">Get Weather</button>

	<!--v-if directive is a conditional rendering directive-->
    <div v-if="weather">
      <p>{{ weather.name }}: {{ weather.main.temp }}°C</p>
      <p>{{ weather.weather[0].description }}</p>
    </div>

    <p v-if="error" style="color:red;">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// ref() creates a reactive reference to a value
// meaning if that value changes, Vue automatically updates any part of the DOM (template) that depends on it
import { fetchWeather } from '../api/weatherService';

const city = ref('Paris');
type WeatherData = {
  name: string;
  main: {
    temp: number;
  };
  weather: Array<{
    description: string;
  }>;
};
const weather = ref<WeatherData | null>(null);
const error = ref<string | null>(null);

const loadWeather = async () => {
  error.value = null;
  try {
    weather.value = await fetchWeather(city.value);
	// .value is used to access or modify the inner value stored inside a ref()
  } catch (err: any) {
    error.value = err.message;
  }
};
</script>

