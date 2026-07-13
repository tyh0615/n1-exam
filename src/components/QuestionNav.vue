<template>
  <div class="question-nav" :class="{ expanded: isExpanded }">
    <!-- Toggle bar -->
    <div class="nav-toggle" @click="toggle">
      <span class="toggle-label">
        已答题数：
        <span class="toggle-progress"
          >{{ answeredCount }}/{{ questions.length }}</span
        >
      </span>
      <el-icon :class="{ rotated: isExpanded }"><ArrowUp /></el-icon>
    </div>

    <!-- Collapsed: horizontal scroll -->
    <div v-if="!isExpanded" class="nav-pills" ref="pillsRef">
      <span
        v-for="(q, i) in questions"
        :key="q.id"
        class="pill"
        :class="{
          active: i === currentIndex,
          answered: answers[q.id] !== undefined,
        }"
        @click="$emit('navigate', i)"
      >
        {{ i + 1 }}
      </span>
    </div>

    <!-- Expanded: full grid -->
    <div v-else class="nav-grid-wrap">
      <div class="nav-grid">
        <span
          v-for="(q, i) in questions"
          :key="q.id"
          class="grid-pill"
          :class="{
            active: i === currentIndex,
            answered: answers[q.id] !== undefined,
          }"
          @click="navigateAndClose(i)"
        >
          {{ i + 1 }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from "vue";

const props = defineProps({
  questions: { type: Array, required: true },
  answers: { type: Object, required: true },
  currentIndex: { type: Number, required: true },
  answeredCount: { type: Number, default: 0 },
});

const emit = defineEmits(["navigate"]);

const isExpanded = ref(false);
const pillsRef = ref(null);

function toggle() {
  isExpanded.value = !isExpanded.value;
}

function navigateAndClose(i) {
  emit("navigate", i);
  isExpanded.value = false;
}

// 折叠态下自动滚动当前题号到可见区域
watch(
  () => props.currentIndex,
  () => {
    if (isExpanded.value) return;
    nextTick(() => {
      const container = pillsRef.value;
      if (!container) return;
      const activePill = container.querySelector(".pill.active");
      if (activePill) {
        activePill.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    });
  },
);
</script>

<style scoped>
.question-nav {
  background: #fff;
  border-top: 1px solid #e2e8f0;
  flex-shrink: 0;
  transition: max-height 0.3s ease;
  max-height: 80px;
  overflow: hidden;
}
.question-nav.expanded {
  max-height: 420px;
}

/* Toggle bar */
.nav-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}
.nav-toggle:active {
  background: #f8fafc;
}
.toggle-label {
  font-size: 13px;
  font-weight: 600;
  color: #475569;
  display: flex;
  align-items: center;
  gap: 8px;
}
.toggle-progress {
  font-size: 11px;
  font-weight: 500;
  color: #94a3b8;
  background: #f1f5f9;
  padding: 2px 8px;
  border-radius: 10px;
}
.nav-toggle .el-icon {
  font-size: 14px;
  color: #94a3b8;
  transition: transform 0.25s ease;
}
.nav-toggle .el-icon.rotated {
  transform: rotate(180deg);
}

/* Collapsed: horizontal scroll pills */
.nav-pills {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  padding: 2px 12px 8px;
  scroll-behavior: smooth;
}
.nav-pills::-webkit-scrollbar {
  display: none;
}
.pill {
  flex-shrink: 0;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  background: #f1f5f9;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.15s;
}
.pill:active {
  transform: scale(0.92);
}
.pill.answered {
  background: #dbeafe;
  color: #2b5aed;
}
.pill.active {
  background: #2b5aed;
  color: #fff;
  box-shadow: 0 2px 6px rgba(43, 90, 237, 0.35);
}

/* Expanded: full grid */
.nav-grid-wrap {
  padding: 0 16px 12px;
  max-height: 340px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}
.nav-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.grid-pill {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
  background: #f1f5f9;
  color: #64748b;
  cursor: pointer;
  transition: all 0.15s;
}
.grid-pill:active {
  transform: scale(0.94);
}
.grid-pill.answered {
  background: #dbeafe;
  color: #2b5aed;
}
.grid-pill.active {
  background: #2b5aed;
  color: #fff;
  box-shadow: 0 2px 8px rgba(43, 90, 237, 0.4);
}
</style>
