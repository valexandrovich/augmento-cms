<script setup>
import {useAuthStore} from "@/stores/auth";
import { useRouter } from 'vue-router';

const auth = useAuthStore();
const router = useRouter();

const signOut = async () => {
  try {
    await auth.logout();
    router.push('/login');
  } catch (error) {
    console.error('Error logging in:', error);
  }
}
</script>

<template>
<div>
  My account
</div>
  <button class="bg-red-200 p-4" @click="signOut">Sign out</button>
</template>

<style scoped>

</style>