import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

createApp(App).mount('#app')

// Check access of environment variable
// Variables must be prefixed with VITE_ to be available to the frontend
const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
console.log("API Key:", apiKey);



