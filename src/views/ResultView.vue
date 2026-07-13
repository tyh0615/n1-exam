<template>
  <div class="result-page" v-if="result">
    <!-- 分数区域 -->
    <div class="score-section">
      <div class="score-circle" :class="isPassed ? 'pass' : 'fail'">
        <span class="score-num">{{ result.score }}</span>
        <span class="score-total">/ {{ result.total }}</span>
      </div>
      <div class="pass-text" :class="isPassed ? 'pass' : 'fail'">
        {{ isPassed ? "🎉 恭喜通过！" : "😞 未通过，继续加油！" }}
      </div>
      <div class="score-detail">
        <span>答对 {{ result.correctCount }} 题</span>
        <span class="sep">|</span>
        <span>答错 {{ result.wrongCount }} 题</span>
        <span class="sep">|</span>
        <span>正确率 {{ correctRate }}%</span>
      </div>
    </div>

    <!-- 逐题回顾 -->
    <div class="review-section">
      <h3 class="review-title">答题详情</h3>
      <div
        v-for="(item, i) in result.details"
        :key="item.id"
        class="review-card"
        :class="{ correct: item.isCorrect, wrong: !item.isCorrect }"
      >
        <div class="review-header">
          <span class="review-index"
            >{{ i + 1 }}. {{ typeLabel(item.type) }}</span
          >
          <span class="review-score" :class="item.isCorrect ? 'got' : 'lost'">
            {{ item.isCorrect ? "+" + item.gotScore : "+0" }}/{{
              item.fullScore
            }}分
          </span>
        </div>
        <div class="review-question">{{ item.question }}</div>
        <div class="review-answers">
          <div class="answer-row" v-if="item.userAnswer !== undefined">
            <span class="label">你的答案：</span>
            <span :class="item.isCorrect ? 'text-correct' : 'text-wrong'">
              {{ formatAnswer(item.userAnswer, item.type) || "未作答" }}
            </span>
            <el-icon v-if="item.isCorrect" class="icon-correct"
              ><CircleCheckFilled
            /></el-icon>
            <el-icon v-else class="icon-wrong"><CircleCloseFilled /></el-icon>
          </div>
          <div class="answer-row">
            <span class="label">正确答案：</span>
            <span class="text-correct">{{
              formatAnswer(item.correctAnswer, item.type)
            }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部操作 -->
    <div class="result-actions">
      <el-button size="large" class="action-btn" @click="$router.push('/')">
        返回首页
      </el-button>
      <el-button
        type="primary"
        size="large"
        class="action-btn"
        @click="$router.push('/mistakes')"
      >
        查看错题本
      </el-button>
    </div>
  </div>

  <div v-else class="empty-state">
    <p>暂无考试结果</p>
    <el-button type="primary" @click="$router.push('/')">返回首页</el-button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useExamStore } from "@/stores/exam";
import { useMistakeBookStore } from "@/stores/mistakeBook";

const router = useRouter();
const examStore = useExamStore();
const mistakeBookStore = useMistakeBookStore();
const result = ref(null);

onMounted(() => {
  result.value = examStore.result;
  if (result.value) {
    // 将错题加入错题本
    const wrongs = result.value.details.filter((d) => !d.isCorrect);
    if (wrongs.length > 0) {
      mistakeBookStore.addMistakes(
        wrongs.map((w) => ({
          id: w.id,
          type: w.type,
          question: w.question,
          options: w.options,
          answer: w.correctAnswer,
          score: w.fullScore,
        })),
      );
    }
  }
});

const isPassed = computed(() => result.value && result.value.score >= 70);
const correctRate = computed(() => {
  if (!result.value) return 0;
  return Math.round(
    (result.value.correctCount / result.value.details.length) * 100,
  );
});

function typeLabel(type) {
  return { single: "单选", multiple: "多选", judge: "判断" }[type] || "";
}

function formatAnswer(answer, type) {
  if (answer === undefined || answer === null || answer === "") return "未作答";
  if (type === "multiple") {
    if (Array.isArray(answer)) return answer.length > 0 ? answer.join("、") : "未作答";
    return String(answer);
  }
  // 单选题返回 "A"、"B" 等字母，判断题返回 "正确"/"错误"
  return String(answer);
}
</script>

<style scoped>
.result-page {
  padding: 24px 16px;
  padding-bottom: calc(32px + env(safe-area-inset-bottom, 16px));
  min-height: 100vh;
}

/* 分数区域 */
.score-section {
  text-align: center;
  padding: 24px 0 16px;
}
.score-circle {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  margin: 0 auto 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 6px solid;
}
.score-circle.pass {
  border-color: #22c55e;
  background: #f0fdf4;
}
.score-circle.fail {
  border-color: #ef4444;
  background: #fef2f2;
}
.score-num {
  font-size: 42px;
  font-weight: 800;
  line-height: 1;
}
.score-circle.pass .score-num {
  color: #22c55e;
}
.score-circle.fail .score-num {
  color: #ef4444;
}
.score-total {
  font-size: 14px;
  color: #64748b;
}
.pass-text {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 8px;
}
.pass-text.pass {
  color: #22c55e;
}
.pass-text.fail {
  color: #ef4444;
}
.score-detail {
  font-size: 13px;
  color: #64748b;
}
.sep {
  margin: 0 8px;
  color: #cbd5e1;
}

/* 逐题回顾 */
.review-section {
  margin-top: 16px;
}
.review-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
}
.review-card {
  background: #fff;
  border-radius: 12px;
  padding: 14px;
  margin-bottom: 10px;
  border-left: 4px solid;
}
.review-card.correct {
  border-left-color: #22c55e;
}
.review-card.wrong {
  border-left-color: #ef4444;
}
.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}
.review-index {
  font-size: 12px;
  color: #64748b;
  font-weight: 600;
}
.review-score {
  font-size: 12px;
  font-weight: 700;
}
.review-score.got {
  color: #22c55e;
}
.review-score.lost {
  color: #ef4444;
}
.review-question {
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 8px;
  color: #1e293b;
}
.review-answers {
  font-size: 13px;
}
.answer-row {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 4px;
}
.label {
  color: #64748b;
  flex-shrink: 0;
}
.text-correct {
  color: #22c55e;
  font-weight: 600;
}
.text-wrong {
  color: #ef4444;
  font-weight: 600;
}
.icon-correct {
  color: #22c55e;
  font-size: 16px;
}
.icon-wrong {
  color: #ef4444;
  font-size: 16px;
}

/* 底部按钮 */
.result-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}
.action-btn {
  flex: 1;
  height: 48px;
  font-size: 15px;
  border-radius: 12px;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: #94a3b8;
}
</style>
