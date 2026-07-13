<template>
  <div class="exam-page">
    <!-- 顶部状态栏 -->
    <div class="exam-header">
      <div class="header-left">
        <el-button text size="small" @click="confirmExit">
          <el-icon><ArrowLeft /></el-icon> 退出
        </el-button>
      </div>
      <TimerBar ref="timerRef" :duration="100" @timeout="handleTimeout" />
      <div class="header-right">
        <span class="progress-text"
          >{{ examStore.currentIndex + 1 }}/{{
            examStore.questions.length
          }}</span
        >
      </div>
    </div>

    <!-- 题目区域 -->
    <div class="question-area">
      <div class="type-badge" :class="currentQuestion.type">
        {{ typeLabel(currentQuestion.type) }}
        <span class="score-tag">{{ currentQuestion.score }}分</span>
      </div>
      <QuestionCard
        :question="currentQuestion"
        :user-answer="examStore.answers[currentQuestion.id]"
        @update:answer="examStore.setAnswer(currentQuestion.id, $event)"
      />
    </div>

    <!-- 底部题号导航 -->
    <QuestionNav
      :questions="examStore.questions"
      :answers="examStore.answers"
      :answered-count="answeredCount"
      :current-index="examStore.currentIndex"
      @navigate="examStore.currentIndex = $event"
    />

    <!-- 底部操作栏 -->
    <div class="bottom-bar">
      <el-button
        :disabled="examStore.currentIndex === 0"
        @click="examStore.currentIndex--"
        class="nav-btn"
      >
        <el-icon><ArrowLeft /></el-icon> 上一题
      </el-button>
      <el-button type="primary" class="submit-btn" @click="handleSubmit">
        交卷
      </el-button>
      <el-button
        :disabled="examStore.currentIndex === examStore.questions.length - 1"
        @click="examStore.currentIndex++"
        class="nav-btn"
      >
        下一题 <el-icon><ArrowRight /></el-icon>
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useRouter, useRoute, onBeforeRouteLeave } from "vue-router";
import { ElMessageBox } from "element-plus";
import { useExamStore } from "@/stores/exam";
import QuestionCard from "@/components/QuestionCard.vue";
import QuestionNav from "@/components/QuestionNav.vue";
import TimerBar from "@/components/TimerBar.vue";

const router = useRouter();
const route = useRoute();
const examStore = useExamStore();

const timerRef = ref(null);

const currentQuestion = computed(
  () => examStore.questions[examStore.currentIndex] || {},
);

const answeredCount = computed(() => Object.keys(examStore.answers).length);

onMounted(() => {
  const mode = route.query.mode || "full";
  const count = parseInt(route.query.count) || 100;
  const paper = route.query.paper || "exam1";
  examStore.startExam(mode, count, paper);
});

// 退出确认
function confirmExit() {
  const answeredCount = Object.keys(examStore.answers).length;
  if (answeredCount > 0) {
    ElMessageBox.confirm(
      `你已作答 ${answeredCount} 题，确定要退出考试吗？`,
      "退出确认",
      {
        confirmButtonText: "退出",
        cancelButtonText: "继续考试",
        type: "warning",
      },
    )
      .then(() => {
        router.replace("/");
      })
      .catch(() => {});
  } else {
    router.replace("/");
  }
}

// 交卷
function handleSubmit() {
  const total = examStore.questions.length;
  const answered = Object.keys(examStore.answers).length;
  const unAnswered = total - answered;

  let msg = `共 ${total} 题`;
  if (unAnswered > 0) {
    msg += `，还有 ${unAnswered} 题未作答`;
  }
  msg += "，确定交卷吗？";

  ElMessageBox.confirm(msg, "交卷确认", {
    confirmButtonText: "确定交卷",
    cancelButtonText: "继续答题",
    type: "warning",
  })
    .then(() => {
      examStore.submitExam();
      router.replace("/result");
    })
    .catch(() => {});
}

function handleTimeout() {
  examStore.submitExam();
  router.replace("/result");
}

// 浏览器关闭/刷新确认
function beforeUnload(e) {
  if (Object.keys(examStore.answers).length > 0) {
    e.preventDefault();
    e.returnValue = "";
  }
}
onMounted(() => window.addEventListener("beforeunload", beforeUnload));
onBeforeUnmount(() => window.removeEventListener("beforeunload", beforeUnload));

onBeforeRouteLeave((to, from, next) => {
  if (to.path === "/result") {
    next();
    return;
  }
  const answeredCount = Object.keys(examStore.answers).length;
  if (answeredCount === 0) {
    next();
    return;
  }
  ElMessageBox.confirm("离开将丢失当前答题进度，确定离开吗？", "提示", {
    confirmButtonText: "离开",
    cancelButtonText: "继续答题",
    type: "warning",
  })
    .then(() => next())
    .catch(() => next(false));
});

function typeLabel(type) {
  return { single: "单选题", multiple: "多选题", judge: "判断题" }[type] || "";
}
</script>

<style scoped>
.exam-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  height: 100dvh;
  background: #f5f6fa;
  overflow: hidden;
}

/* 顶部 */
.exam-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: #fff;
  border-bottom: 1px solid #e2e8f0;
  flex-shrink: 0;
}
.header-left,
.header-right {
  min-width: 60px;
}
.header-right {
  text-align: right;
}
.progress-text {
  font-size: 14px;
  font-weight: 600;
  color: #2b5aed;
}

/* 题目区 */
.question-area {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  -webkit-overflow-scrolling: touch;
}
.type-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 20px;
  margin-bottom: 12px;
}
.type-badge.single {
  background: #dbeafe;
  color: #1d4ed8;
}
.type-badge.multiple {
  background: #fef3c7;
  color: #b45309;
}
.type-badge.judge {
  background: #dcfce7;
  color: #15803d;
}
.score-tag {
  background: rgba(0, 0, 0, 0.08);
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
}

/* 底部操作栏 */
.bottom-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  padding-bottom: calc(10px + env(safe-area-inset-bottom, 8px));
  background: #fff;
  border-top: 1px solid #e2e8f0;
  flex-shrink: 0;
}
.nav-btn {
  flex: 1;
  height: 44px;
  font-size: 14px;
  border-radius: 10px;
}
.submit-btn {
  flex: 1.2;
  height: 44px;
  font-size: 15px;
  font-weight: 600;
  border-radius: 10px;
}
</style>
