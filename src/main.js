import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './styles/main.css'

// Element Plus 改按需引入（组件由 unplugin-vue-components 自动解析）
// 这里只补两样按需引入覆盖不到的样式：
//  - base.css：Element Plus 的 CSS 变量与基础重置（各组件样式依赖）
//  - el-message-box.css：ElMessageBox 弹窗样式（仅在 ExamView / MistakeBookView 以 API 形式调用）
import 'element-plus/theme-chalk/base.css'
import 'element-plus/theme-chalk/el-message-box.css'

// 仅引入实际用到的图标（原代码 import * 全量注册了 ~700 个图标）
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Star,
  StarFilled,
  Clock,
  Check,
  CircleCheckFilled,
  CircleCloseFilled,
} from '@element-plus/icons-vue'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)

// 仅全局注册用到的图标，供模板中 <el-icon><ArrowLeft /></el-icon> 解析
const icons = {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Star,
  StarFilled,
  Clock,
  Check,
  CircleCheckFilled,
  CircleCloseFilled,
}
for (const [key, component] of Object.entries(icons)) {
  app.component(key, component)
}

app.mount('#app')
