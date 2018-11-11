<template>
  <v-container>
    <p class="mt-4 mb-4 text-xs-left title">How's Your Trip On Bus Going?</p>
    <v-textarea
      solo
      ref="tx"
      name="input-context"
      label="Type Here :)"
      v-model="text"
    >
    </v-textarea>
    <p class="title">at: Russel, Third Street</p>
    <v-btn v-on:click="submit">Submit</v-btn>
  </v-container>
</template>
<script>
  import {db} from '@/plugins/firebase'
  export default {
    data()
    {
      return{
        text:""
      }
    },
    methods: {
      submit()
      {
        db.collection("Messages").add({
          context: this.text,
          latitude: 0,
          longitude: 0,
          place: "hell"
        })
          .then(()=> {
            this.$router.push('/')
        })
          .catch(function(error) {
            this.$router.push('/')
          });
      }
    }
  }
</script>