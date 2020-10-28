import Vue from 'vue'
import VueRouter from 'vue-router'

import Ratp from '../views/Ratp.vue'
import Transilien from '../views/Transilien.vue'
import Sncf from '../views/Sncf.vue'
import NationalRail from '../views/NationalRail.vue'
import TflTube from '../views/TflTube.vue'
import Ns from '../views/NS.vue'
import Admin from '../views/Admin.vue'

Vue.use(VueRouter)

const routes = [
  { path: '/ratp', component: Ratp },
  { path: '/transilien', component: Transilien },
  { path: '/sncf', component: Sncf },
  { path: '/national-rail', component: NationalRail },
  { path: '/tfl-tube', component: TflTube },
  { path: '/ns', component: Ns },
  { path: '/admin', component: Admin },
]

const router = new VueRouter({
  routes  // short for `routes: routes`
})

export default router
