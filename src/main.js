import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import GoogleSignInPlugin from "vue3-google-signin"

import App from './App.vue'
import router from './router'

const app = createApp(App)



// app.config.compilerOptions.isCustomElement = tag => tag === 'model-viewer';

app.use(createPinia())
app.use(GoogleSignInPlugin, {
    clientId: 'CLIENT ID OBTAINED FROM GOOGLE API CONSOLE',
});


app.use(router)


app.mount('#app')
