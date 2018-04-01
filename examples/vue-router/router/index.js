import Vue from 'vue'
import Router from 'vue-router'
import routes from './routes'

const components = {
  NewsList: () => import('@/pages/news/list'),
  NewsDetail: () => import('@/pages/news/detail'),
  NewsComment: () => import('@/pages/news/comment'),
  QuanziList: () => import('@/pages/quanzi/list'),
  QuanziDetail: () => import('@/pages/quanzi/detail')
}

Vue.use(Router)

export default new Router({
  routes: routes.map(route => {
    route.component = components[route.name]
    return route
  }),
  mode: 'history'
})
