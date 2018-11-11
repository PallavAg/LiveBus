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
    <v-btn v-on:click="submit">Submit</v-btn>
  </v-container>
</template>
<script>
  import firebase,{db,auth} from '@/plugins/firebase'
  export default {
    data()
    {
      return{
        text:"",
      }
    },
    mounted(){
      console.log("ROUTE:" + this.$route.params.routeID)
    },
    methods: {
      submit() {
        let obj ={}
        obj[`users.${auth.currentUser.uid}.message`] = this.$refs['tx'].value
        obj[`users.${auth.currentUser.uid}.updated`] = new Date()
        db.collection('routes').doc(this.route).update(obj)
          .then(() =>
          {
            this.$router.push('/')
          })
          .catch(err =>
          {
            this.$router.push('/')
          })
      }
    }
  }
</script>