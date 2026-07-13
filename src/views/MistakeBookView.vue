<template>
  <div class="mistake-page">
    <div class="page-header">
      <el-button text @click="$router.push('/')">
        <el-icon><ArrowLeft /></el-icon> 返回
      </el-button>
      <h2 class="page-title">错题本</h2>
      <el-button
        v-if="mistakes.length > 0"
        text
        type="danger"
        @click="handleClear"
      >
        清空
      </el-button>
      <span v-else style="width: 40px"></span>
    </div>

    <!-- 空状态 -->
    <div v-if="mistakes.length === 0" class="empty">
      <span class="empty-icon">📝</span>
      <p>暂无错题，继续保持！</p>
    </div>

    <!-- 错题列表 -->
    <div v-else class="mistake-list">
      <div v-for="(item, i) in mistakes" :key="item.id" class="mistake-card">
        <div class="mistake-header">
          <span class="badge-type">{{ typeLabel(item.type) }}</span>
          <span class="badge-score">{{ item.score }}分</span>
        </div>
        <div class="mistake-question">{{ item.question }}</div>
        <div class="mistake-answer">
          正确答案：<span class="answer-text">{{ item.answer }}</span>
        </div>
      </div>
    </div>

    <!-- 底部重做 -->
    <div v-if="mistakes.length > 0" class="retry-bar">
      <el-button
        type="primary"
        size="large"
        class="retry-btn"
        @click="retryMistakes"
      >
        重做错题（{{ mistakes.length }}题）
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessageBox } from "element-plus";
import { useMistakeBookStore } from "@/stores/mistakeBook";

const router = useRouter();
const mistakeBookStore = useMistakeBookStore();
const mistakes = ref([]);

onMounted(() => {
  mistakes.value = mistakeBookStore.getMistakes();
});

function typeLabel(type) {
  return { single: "单选", multiple: "多选", judge: "判断" }[type] || "";
}

function handleClear() {
  ElMessageBox.confirm("确定清空所有错题吗？", "确认", {
    confirmButtonText: "清空",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      mistakeBookStore.clearAll();
      mistakes.value = [];
    })
    .catch(() => {});
}

function retryMistakes() {
  // 将错题暂存到 sessionStorage，跳转考试页时读取
  sessionStorage.setItem("retry-mistakes", JSON.stringify(mistakes.value));
  router.push({ path: "/exam", query: { mode: "retry" } });
}
</script>

<style scoped>
.mistake-page {
  min-height: 100vh;
  padding-bottom: calc(100px + env(safe-area-inset-bottom, 16px));
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: #fff;
  border-bottom: 1px solid #e2e8f0;
  position: sticky;
  top: 0;
  z-index: 10;
}
.page-title {
  font-size: 17px;
  font-weight: 600;
}

.empty {
  text-align: center;
  padding: 100px 20px;
  color: #94a3b8;
}
.empty-icon {
  font-size: 56px;
  display: block;
  margin-bottom: 12px;
}

.mistake-list {
  padding: 12px 16px;
}
.mistake-card {
  background: #fff;
  border-radius: 12px;
  padding: 14px;
  margin-bottom: 10px;
  border-left: 4px solid #ef4444;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}
.mistake-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
}
.badge-type {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 10px;
  background: #fee2e2;
  color: #dc2626;
}
.badge-score {
  font-size: 12px;
  color: #64748b;
}
.mistake-question {
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 8px;
  color: #1e293b;
}
.mistake-answer {
  font-size: 13px;
  color: #64748b;
}
.answer-text {
  color: #22c55e;
  font-weight: 700;
}

.retry-bar {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 480px;
  padding: 12px 16px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom, 8px));
  background: #fff;
  border-top: 1px solid #e2e8f0;
}
.retry-btn {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 12px;
}
</style>
