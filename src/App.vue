<template>
  <div id="app"><Editor v-model="state" :formData="formData"></Editor></div>
</template>

<script setup>
import Editor from "/src/packages/editor.jsx";
import data from "/src/data.json";
import { ref } from "@vue/reactivity";
import { registerConfig as config } from "./utils/editor-config.jsx";
import { provide } from "vue-demi";
const state = ref(data);
provide("config", config);
const formData = ref({
  username: "nb",
  password: 123,
  start:1,
  end:100
});
</script>

<style lang="scss">
html,
body,
#app {
  height: 100%;
  width: 100%;
  padding: 0;
  margin: 0;
  overflow: hidden;
}
</style>
