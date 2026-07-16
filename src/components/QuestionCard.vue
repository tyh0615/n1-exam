<template>
  <div class="question-card">
    <p class="question-text">{{ question.question }}</p>

    <!-- 单选题 / 判断题 -->
    <div
      v-if="question.type === 'single' || question.type === 'judge'"
      class="options-list"
    >
      <div
        v-for="(opt, i) in question.options"
        :key="i"
        class="option-item"
        :class="{
          selected: userAnswer === optionKey(i),
          correct: showCorrect && optionKey(i) === question.answer,
          correct:
            showCorrect &&
            userAnswer === optionKey(i) &&
            optionKey(i) !== question.answer,
        }"
        @click="!disabled && selectOption(optionKey(i))"
      >
        <span class="opt-letter">{{ letters[i] }}</span>
        <span class="opt-text">{{ stripPrefix(opt) }}</span>
        <el-icon
          v-if="showCorrect && optionKey(i) === question.answer"
          class="opt-icon right"
          ><CircleCheckFilled
        /></el-icon>
        <el-icon
          v-if="
            showCorrect &&
            userAnswer === optionKey(i) &&
            optionKey(i) !== question.answer
          "
          class="opt-icon right"
          ><CircleCheckFilled
        /></el-icon>
      </div>
    </div>

    <!-- 多选题 -->
    <div v-if="question.type === 'multiple'" class="options-list">
      <div
        v-for="(opt, i) in question.options"
        :key="i"
        class="option-item"
        :class="{
          selected: isMultipleSelected(optionKey(i)),
          correct: showCorrect && question.answer.includes(optionKey(i)),
          wrong:
            showCorrect &&
            isMultipleSelected(optionKey(i)) &&
            !question.answer.includes(optionKey(i)),
        }"
        @click="!disabled && toggleMultiple(optionKey(i))"
      >
        <span
          class="opt-letter check-box"
          :class="{ checked: isMultipleSelected(optionKey(i)) }"
        >
          <el-icon v-if="isMultipleSelected(optionKey(i))"><Check /></el-icon>
        </span>
        <span class="opt-text">{{ stripPrefix(opt) }}</span>
        <el-icon
          v-if="showCorrect && question.answer.includes(optionKey(i))"
          class="opt-icon right"
          ><CircleCheckFilled
        /></el-icon>
        <el-icon
          v-if="
            showCorrect &&
            isMultipleSelected(optionKey(i)) &&
            !question.answer.includes(optionKey(i))
          "
          class="opt-icon wrong"
          ><CircleCloseFilled
        /></el-icon>
      </div>
    </div>

    <!-- 解析提示 -->
    <div
      v-if="showCorrect"
      class="hint-bar"
      style="display: flex; justify-content: space-between; align-items: center"
    >
      <div>💡 正确答案：{{ formatCorrectAnswer }}</div>
      <div>当前选择为：{{ formatUserAnswer }}</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  question: { type: Object, required: true },
  userAnswer: { default: undefined },
  disabled: { type: Boolean, default: false },
  showAnswer: { type: Boolean, default: false },
});

const emit = defineEmits(["update:answer"]);

const letters = ["A", "B", "C", "D", "E", "F"];

// 是否在结果回看模式 / 背题模式
const showCorrect = computed(
  () => props.showAnswer || (props.disabled && props.userAnswer !== undefined),
);

const isCorrect = computed(() => {
  if (!props.question.answer || props.userAnswer === undefined) return false;
  if (props.question.type === "multiple") {
    const userSet = new Set(
      Array.isArray(props.userAnswer) ? props.userAnswer : [],
    );
    const correctSet = new Set(props.question.answer.split(""));
    if (userSet.size === 0) return false;
    // 完全匹配才算对
    if (userSet.size !== correctSet.size) return false;
    return [...userSet].every((v) => correctSet.has(v));
  }
  return props.userAnswer === props.question.answer;
});

const formatCorrectAnswer = computed(() => {
  const a = props.question.answer;
  if (props.question.type === "multiple") return a.split("").join("、");
  return a;
});

const formatUserAnswer = computed(() => {
  const a = props.userAnswer;
  if (a === undefined || a === "") return "未作答";
  if (Array.isArray(a)) return a.length > 0 ? a.join("、") : "未作答";
  return String(a);
});

function optionKey(index) {
  return letters[index];
}

function stripPrefix(opt) {
  return opt.replace(/^[A-F][.、．]\s*/, "");
}

function selectOption(key) {
  if (props.disabled) return;
  emit("update:answer", key);
}

function isMultipleSelected(key) {
  if (!Array.isArray(props.userAnswer)) return false;
  return props.userAnswer.includes(key);
}

function toggleMultiple(key) {
  if (props.disabled) return;
  let current = Array.isArray(props.userAnswer) ? [...props.userAnswer] : [];
  const idx = current.indexOf(key);
  if (idx > -1) {
    current.splice(idx, 1);
  } else {
    current.push(key);
  }
  emit("update:answer", current);
}
</script>

<style scoped>
.question-text {
  font-size: 16px;
  font-weight: 600;
  line-height: 1.7;
  color: #1e293b;
  margin-bottom: 16px;
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 12px;
  border-radius: 10px;
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.15s;
  position: relative;
}
.option-item:active {
  background: #f1f5f9;
}
.option-item.selected {
  background: #e8edff;
  border-color: #2b5aed;
}
.option-item.correct {
  background: #f0fdf4;
  border-color: #22c55e;
}
.option-item.wrong {
  background: #fef2f2;
  border-color: #ef4444;
}

.opt-letter {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  color: #64748b;
  flex-shrink: 0;
}
.option-item.selected .opt-letter {
  background: #2b5aed;
  color: #fff;
}
.option-item.correct .opt-letter {
  background: #22c55e;
  color: #fff;
}
.option-item.wrong .opt-letter {
  background: #ef4444;
  color: #fff;
}

.check-box {
  border-radius: 6px;
}
.check-box.checked {
  background: #2b5aed;
  color: #fff;
}

.opt-text {
  flex: 1;
  font-size: 14px;
  line-height: 1.5;
  color: #334155;
}

.opt-icon {
  font-size: 18px;
  flex-shrink: 0;
}
.opt-icon.right {
  color: #22c55e;
}
.opt-icon.wrong {
  color: #ef4444;
}

.hint-bar {
  margin-top: 14px;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 13px;
}
.hint-answer {
  color: #2b5aed;
}
.hint-answer strong {
  color: #1d4ed8;
}
.hint-review {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.hint-correct {
  color: #16a34a;
  font-weight: 600;
}
.hint-wrong {
  color: #dc2626;
  font-weight: 600;
}
.hint-detail {
  font-size: 13px;
  color: #475569;
  line-height: 1.6;
}
.hint-detail strong {
  color: #16a34a;
}
.hint-detail .text-wrong {
  color: #dc2626;
  font-weight: 600;
}
</style>
