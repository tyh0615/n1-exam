<template>
  <div class="timer" :class="{ warning: isWarning }">
    <el-icon><Clock /></el-icon>
    <span class="time-text">{{ display }}</span>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";

const props = defineProps({
  duration: { type: Number, default: 90 }, // 分钟
});

const emit = defineEmits(["timeout"]);

const remaining = ref(props.duration * 60); // 秒
let timer = null;

const display = computed(() => {
  const m = Math.floor(remaining.value / 60);
  const s = remaining.value % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
});

const isWarning = computed(() => remaining.value <= 300); // 5分钟警告

function tick() {
  if (remaining.value <= 0) {
    clearInterval(timer);
    emit("timeout");
    return;
  }
  remaining.value--;
}

onMounted(() => {
  timer = setInterval(tick, 1000);
});
onBeforeUnmount(() => {
  clearInterval(timer);
});

// 暴露方法给父组件获取剩余时间
defineExpose({ remaining });
</script>

<style scoped>
.timer {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 15px;
  font-weight: 700;
  color: #1e293b;
  font-variant-numeric: tabular-nums;
}
.timer.warning {
  color: #ef4444;
  animation: blink 1s infinite;
}
@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
}
.time-text {
  min-width: 42px;
}
</style>
