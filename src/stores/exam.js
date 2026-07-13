import { defineStore } from 'pinia'
import questionsData from '@/data/questions.json'
import ExamPaper1 from '@/data/ExamPaper1.json'
import ExamPaper2 from '@/data/ExamPaper2.json'
import ExamPaper3 from '@/data/ExamPaper3.json'
import ExamPaper4 from '@/data/ExamPaper4.json'
import ExamPaper5 from '@/data/ExamPaper5.json'

const PAPER_MAP = {
  questions: { label: '基础题库', data: questionsData, count: 85 },
  exam1: { label: '模拟试卷一', data: ExamPaper1, count: 100 },
  exam2: { label: '模拟试卷二', data: ExamPaper2, count: 100 },
  exam3: { label: '模拟试卷三', data: ExamPaper3, count: 100 },
  exam4: { label: '模拟试卷四', data: ExamPaper4, count: 100 },
  exam5: { label: '模拟试卷五', data: ExamPaper5, count: 100 },
}

function buildList(source) {
  let id = 1
  const list = []
  for (const q of source.single) { list.push({ ...q, id: id++ }) }
  for (const q of source.multiple) { list.push({ ...q, id: id++ }) }
  for (const q of source.judge) { list.push({ ...q, id: id++ }) }
  return list
}

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function randomPick(source, totalCount) {
  const singleTotal = source.single.length
  const multipleTotal = source.multiple.length
  const judgeTotal = source.judge.length
  const allTotal = singleTotal + multipleTotal + judgeTotal

  const singleCount = Math.round((singleTotal / allTotal) * totalCount)
  const multipleCount = Math.round((multipleTotal / allTotal) * totalCount)
  const judgeCount = totalCount - singleCount - multipleCount

  const picked = []
  for (const q of shuffle(source.single).slice(0, Math.min(singleCount, singleTotal))) picked.push({ ...q })
  for (const q of shuffle(source.multiple).slice(0, Math.min(multipleCount, multipleTotal))) picked.push({ ...q })
  for (const q of shuffle(source.judge).slice(0, Math.min(judgeCount, judgeTotal))) picked.push({ ...q })

  return shuffle(picked).map((q, i) => ({ ...q, id: i + 1 }))
}

function retryMistakes() {
  try {
    const raw = sessionStorage.getItem('retry-mistakes')
    if (raw) {
      const list = JSON.parse(raw)
      sessionStorage.removeItem('retry-mistakes')
      return shuffle(list).map((q, i) => ({ ...q, id: i + 1 }))
    }
  } catch (e) {}
  return null
}

function scoreMultiple(userAnswer, correctAnswer, fullScore) {
  if (!Array.isArray(userAnswer) || userAnswer.length === 0) return { gotScore: 0, isCorrect: false }
  const userSet = new Set(userAnswer)
  const correctSet = new Set(correctAnswer.split(''))
  const allInCorrect = [...userSet].every(v => correctSet.has(v))
  if (!allInCorrect) return { gotScore: 0, isCorrect: false }
  if (userSet.size === correctSet.size) return { gotScore: fullScore, isCorrect: true }
  return { gotScore: 1, isCorrect: false }
}

function scoreJudge(userAnswer, correctAnswer, fullScore) {
  if (userAnswer === undefined) return { gotScore: 0, isCorrect: false }
  const isCorrect = userAnswer === correctAnswer
  return { gotScore: isCorrect ? fullScore : 0, isCorrect }
}

function scoreSingle(userAnswer, correctAnswer, fullScore) {
  if (userAnswer === undefined) return { gotScore: 0, isCorrect: false }
  const isCorrect = userAnswer === correctAnswer
  return { gotScore: isCorrect ? fullScore : 0, isCorrect }
}

export const useExamStore = defineStore('exam', {
  state: () => ({
    questions: [],
    answers: {},
    currentIndex: 0,
    currentPaper: 'questions',
    result: null,
  }),

  getters: {
    paperTotal() {
      return PAPER_MAP[this.currentPaper]?.count || 85
    },
  },

  actions: {
    startExam(mode, count = 100, paper = 'questions') {
      // 清空已有 key 而不是替换整个对象，保持响应式引用链
      Object.keys(this.answers).forEach(k => delete this.answers[k])
      this.currentIndex = 0
      this.currentPaper = paper
      const source = PAPER_MAP[paper]?.data || questionsData
      const maxCount = PAPER_MAP[paper]?.count || 85

      if (mode === 'retry') {
        const retryList = retryMistakes()
        this.questions = retryList || buildList(source)
      } else if (mode === 'random') {
        this.questions = randomPick(source, Math.min(count, maxCount))
      } else if (mode === 'paper') {
        // 按题库答题：顺序做题，不随机
        this.questions = buildList(source)
      } else {
        // full mode: use selected paper's data
        this.questions = buildList(source)
      }
    },

    setAnswer(questionId, answer) {
      this.answers[questionId] = answer
    },

    submitExam() {
      let totalScore = 0
      let correctCount = 0
      const details = []

      for (const q of this.questions) {
        const userAns = this.answers[q.id]
        let scored

        if (q.type === 'multiple') {
          scored = scoreMultiple(userAns, q.answer, q.score)
        } else if (q.type === 'judge') {
          scored = scoreJudge(userAns, q.answer, q.score)
        } else {
          scored = scoreSingle(userAns, q.answer, q.score)
        }

        totalScore += scored.gotScore
        if (scored.isCorrect) correctCount++

        details.push({
          id: q.id,
          type: q.type,
          question: q.question,
          options: q.options,
          userAnswer: userAns,
          correctAnswer: q.answer,
          fullScore: q.score,
          gotScore: scored.gotScore,
          isCorrect: scored.isCorrect,
        })
      }

      const questionCount = this.questions.length
      const totalPossible = this.questions.reduce((sum, q) => sum + q.score, 0)

      const result = {
        score: totalScore,
        total: totalPossible,
        correctCount,
        wrongCount: questionCount - correctCount,
        details,
      }
      this.result = result
      return result
    },

    // 获取某个题库的列表（用于背题模式）
    getPaperQuestions(paperKey) {
      const source = PAPER_MAP[paperKey]?.data || questionsData
      return buildList(source)
    },
  },
})

export { PAPER_MAP }
