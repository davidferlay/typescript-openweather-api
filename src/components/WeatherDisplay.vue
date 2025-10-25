<template>
  <div>
    <h2>Weather in {{ city }}</h2>
    <input v-model="city" placeholder="Enter a city" />
    <button @click="loadWeather">Get Weather</button>

    <div v-if="weather">
      <p>{{ weather.name }}: {{ weather.main.temp }}°C</p>
      <p>{{ weather.weather[0].description }}</p>
    </div>

    <p v-if="error" style="color:red;">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { fetchWeather } from '../api/weatherService';

const city = ref('Paris');
const weather = ref<any>(null);
const error = ref<string | null>(null);

const loadWeather = async () => {
  error.value = null;
  try {
    weather.value = await fetchWeather(city.value);
  } catch (err: any) {
    error.value = err.message;
  }
};
</script>

