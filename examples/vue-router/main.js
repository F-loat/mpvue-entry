import Vue from 'vue'
import router from '@/router'
import store from '@/store'
import App from './App'

Vue.config.productionTip = false

const app = new Vue({
  el: '#app',
  router,
  store,
  ...App
})
app.$mount()
