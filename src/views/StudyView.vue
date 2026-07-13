<template>
  <div class="study-page">
    <!-- 顶部导航栏 -->
    <div class="study-header">
      <el-button text @click="$router.push('/')">
        <el-icon><ArrowLeft /></el-icon> 返回
      </el-button>
      <h2 class="study-title">背题模式</h2>
      <el-switch
        v-model="filterBookmarked"
        size="small"
        active-text="仅收藏"
        inactive-text="全部"
      />
    </div>

    <!-- 题库选择 -->
    <div class="paper-bar">
      <el-select
        v-model="currentPaper"
        size="small"
        style="width: 140px"
        @change="onPaperChange"
      >
        <el-option
          v-for="p in paperList"
          :key="p.key"
          :label="p.label"
          :value="p.key"
        />
      </el-select>
      <span class="paper-count">共 {{ questions.length }} 题</span>
    </div>

    <!-- 题目列表 -->
    <div class="study-list">
      <div v-for="(q, i) in filteredQuestions" :key="q.id" class="study-card">
        <div class="card-top">
          <span class="type-badge" :class="q.type">
            {{ typeLabel(q.type) }}
            <span class="score-tag">{{ q.score }}分</span>
          </span>
          <el-button
            text
            class="bookmark-btn"
            :class="{ bookmarked: bookmarkStore.bookmarkIds.has(q.id) }"
            @click="toggleFav(q)"
          >
            <el-icon :size="20">
              <StarFilled v-if="bookmarkStore.bookmarkIds.has(q.id)" />
              <Star v-else />
            </el-icon>
          </el-button>
        </div>
        <div class="card-index">第 {{ i + 1 }} 题</div>
        <QuestionCard
          :question="q"
          :user-answer="correctAnswers[q.id]"
          :show-answer="true"
          :disabled="false"
        />
      </div>
    </div>

    <!-- 空状态 -->
    <div
      v-if="filterBookmarked && filteredQuestions.length === 0"
      class="empty"
    >
      <span class="empty-icon">⭐</span>
      <p>暂无收藏题目</p>
    </div>

    <!-- 底部统计 -->
    <div class="study-footer">
      <span>共 {{ questions.length }} 题</span>
      <span v-if="filterBookmarked"
        >总收藏 {{ bookmarkStore.getBookmarks().length }} 题</span
      >
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from "vue";
import questionsData from "@/data/questions.json";
import ExamPaper1 from "@/data/ExamPaper1.json";
import ExamPaper2 from "@/data/ExamPaper2.json";
import ExamPaper3 from "@/data/ExamPaper3.json";
import ExamPaper4 from "@/data/ExamPaper4.json";
import ExamPaper5 from "@/data/ExamPaper5.json";
import QuestionCard from "@/components/QuestionCard.vue";
import { useBookmarkStore } from "@/stores/bookmark";

const bookmarkStore = useBookmarkStore();

const PAPER_MAP = {
  questions: { label: "基础题库", data: questionsData },
  exam1: { label: "模拟试卷一", data: ExamPaper1 },
  exam2: { label: "模拟试卷二", data: ExamPaper2 },
  exam3: { label: "模拟试卷三", data: ExamPaper3 },
  exam4: { label: "模拟试卷四", data: ExamPaper4 },
  exam5: { label: "模拟试卷五", data: ExamPaper5 },
};

const paperList = Object.entries(PAPER_MAP).map(([key, val]) => ({
  key,
  label: val.label,
}));

const currentPaper = ref("exam1");

function buildList(source) {
  const list = [];
  for (const q of source.single) list.push({ ...q });
  for (const q of source.multiple) list.push({ ...q });
  for (const q of source.judge) list.push({ ...q });
  return list;
}

const questions = ref(buildList(PAPER_MAP[currentPaper.value].data));
const filterBookmarked = ref(false);

// 为每道题预填正确答案
const correctAnswers = reactive({});
function rebuildAnswers() {
  Object.keys(correctAnswers).forEach((k) => delete correctAnswers[k]);
  for (const q of questions.value) {
    if (q.type === "multiple") {
      correctAnswers[q.id] = q.answer.split("");
    } else if (q.type === "judge") {
      // 判断题选项是 ["正确", "错误"]，用 indexOf 映射到字母键 "A" 或 "B"
      const idx = q.options.indexOf(q.answer);
      correctAnswers[q.id] = idx >= 0 ? ["A", "B", "C", "D", "E", "F"][idx] : q.answer;
    } else {
      correctAnswers[q.id] = q.answer;
    }
  }
}
rebuildAnswers();

function onPaperChange(key) {
  questions.value = buildList(PAPER_MAP[key].data);
  rebuildAnswers();
}

function toggleFav(q) {
  bookmarkStore.toggleBookmark(q);
}

const filteredQuestions = computed(() => {
  if (filterBookmarked.value) {
    return questions.value.filter((q) => bookmarkStore.bookmarkIds.has(q.id));
  }
  return questions.value;
});

function typeLabel(type) {
  return { single: "单选题", multiple: "多选题", judge: "判断题" }[type] || "";
}
</script>

<style scoped>
.study-page {
  min-height: 100vh;
  background: #f5f6fa;
}

/* 顶部 */
.study-header {
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
.study-title {
  font-size: 17px;
  font-weight: 600;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

/* 题库选择栏 */
.paper-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  background: #fff;
  border-bottom: 1px solid #e2e8f0;
  position: sticky;
  top: 61px;
  z-index: 10;
}
.paper-count {
  font-size: 13px;
  color: #64748b;
}

/* 题目列表 */
.study-list {
  padding: 12px 16px;
  padding-bottom: 60px;
}
.study-card {
  background: #fff;
  border-radius: 12px;
  padding: 14px;
  margin-bottom: 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}
.card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
.card-index {
  font-size: 12px;
  color: #94a3b8;
  margin-bottom: 8px;
}

/* 题型标签 */
.type-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 20px;
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

/* 收藏按钮 */
.bookmark-btn {
  color: #cbd5e1;
  padding: 4px;
  transition: color 0.2s;
}
.bookmark-btn.bookmarked {
  color: #f59e0b;
}
.bookmark-btn:active {
  transform: scale(1.1);
}

/* 空状态 */
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

/* 底部统计 */
.study-footer {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 480px;
  display: flex;
  justify-content: space-between;
  padding: 10px 16px;
  padding-bottom: calc(10px + env(safe-area-inset-bottom, 8px));
  background: #fff;
  border-top: 1px solid #e2e8f0;
  font-size: 13px;
  color: #64748b;
}
</style>
