<script setup>
import {useAuthStore} from "@/stores/auth";
import {useRouter} from 'vue-router';
import axios from '@/utils/axios.config';
import {ref} from "vue";

const auth = useAuthStore();
const router = useRouter();
const apiBaseURL = import.meta.env.VITE_API_BASE_URL;

const signOut = async () => {
  try {
    await auth.logout();
    router.push('/login');
  } catch (error) {
    console.error('Error logging in:', error);
  }
}

const projectreposnse = ref('')
const getProjects = () => {

  projectreposnse.value = ''
  const token = localStorage.getItem('jwt');
  console.log('Token: ' + token)

  axios.get(apiBaseURL + '/v1/project', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
      .then(resp => {
        projectreposnse.value = resp

      })
}
</script>

<template>
  <div>
    My account
  </div>

  <div class="p-12">
    RESP: {{ projectreposnse }}
  </div>

  <button class="bg-red-200 p-4" @click="signOut">Sign out</button>
  <button class="bg-blue-200 p-4" @click="getProjects">Get projects</button>
</template>

<style scoped>

</style>