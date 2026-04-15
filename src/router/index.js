import { createRouter, createWebHashHistory } from 'vue-router'
import LayoutView from '@/views/layout/index.vue'
import IndexView from '@/views/index/index.vue'
import DownloadView from '@/views/download/index.vue'
import ArticlesView from '@/views/articles/index.vue'
import JoinView from '@/views/join/index.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      component: LayoutView,
      children: [
        {
          path: '',
          name: 'index',
          component: IndexView
        },
        {
          path: 'download',
          name: 'download',
          component: DownloadView
        },
        {
          path: 'articles',
          name: 'articles',
          component: ArticlesView
        },
        {
          path: 'join',
          name: 'join',
          component: JoinView
        }
      ]
    }
  ]
})

export default router
