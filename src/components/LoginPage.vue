<template>
    <div>
    </div>
</template>
<script>
    import { LoadAuthUI } from '@/plugins/firebase'
    export default {
        mounted() {
            LoadAuthUI(this.$el)
        }
    }
</script>