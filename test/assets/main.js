import Vue from 'vue';
import store from '@/store';
import mixin from '@/mixin';
import App from '@/App';

Vue.config.productionTip = false;
Vue.mixin(mixin);

const app = new Vue({
  store,
  ...App,
});
app.$mount();

export default {
  config: {
    pages: [
      '^pages/news/list',
    ],
    window: {
      backgroundTextStyle: 'light',
    },
  },
};
