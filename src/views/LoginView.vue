<script setup>

import {useAuthStore} from "@/stores/auth";
import { useRouter, useRoute } from 'vue-router';
import {ref} from "vue";




const auth = useAuthStore();
const router = useRouter();
const route = useRoute();
const email = ref('beloenko23@gmail.com');
const password = ref('Javascript!233');

const signIn = async () => {
  try {
    await auth.login({ email: email.value, password: password.value });
    if (route.query.redirect) {
      router.push(route.query.redirect);
    } else {
      router.push('/dashboard');
    }
  } catch (error) {
    console.error('Error logging in:', error);
  }
};





</script>

<template>
<div>Login view</div>

  {{email}}
  {{password}}

  <div class="flex flex-col gap-5 ">
    <label>
      Email
      <input type="text" v-model="email">
    </label>
    <label>
      Password
      <input type="password" v-model="password">
    </label>
    <div>
    <button class="bg-blue-500 py-2 px-6" @click="signIn">Sign in</button>
    </div>
  </div>

</template>

<style scoped>

</style>