<template>
  <v-app class="secondary">
    <v-toolbar class="primary" app>
      <v-toolbar-title class="mx-0 px-0" v-on:click="home">
        <v-img
          :src="require('./assets/bus-side-view.svg')"
          contain
          width="55"
          height="40"
        ></v-img>
      </v-toolbar-title>
      <v-toolbar-title class="ml-0 px-0">
        live-bus
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon v-on:click="login">
        <v-icon>account_circle</v-icon>
      </v-btn>
    </v-toolbar>
    <v-content>
      <router-view/>
    </v-content>
  </v-app>
</template>
<script>
  export default{
    methods: {
      login: function()
      {
        this.$router.push('login')
      },
      home: function()
      {
        this.$router.push('home')
      }
    }
  }
</script>

