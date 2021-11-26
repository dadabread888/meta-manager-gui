

<template>
    <v-container fluid>
        <v-app-bar app></v-app-bar>
        <router-view/>
    </v-container>
</template>
<script lang="ts">

import { Vue, Component} from 'vue-property-decorator';

@Component
export default class Layout extends Vue {

}
</script>