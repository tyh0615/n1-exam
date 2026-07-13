import { defineStore } from 'pinia'

const STORAGE_KEY = 'n1-exam-mistakes'

export const useMistakeBookStore = defineStore('mistakeBook', {
  state: () => ({
    items: [],
    _loaded: false,
  }),

  getters: {
    mistakes(state) {
      if (!state._loaded) {
        state._loaded = true
        try {
          state.items = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
        } catch {
          state.items = []
        }
      }
      return state.items
    },

    count(state) {
      if (!state._loaded) {
        try {
          state.items = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
          state._loaded = true
        } catch {}
      }
      return state.items.length
    },
  },

  actions: {
    _persist() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items))
    },

    _ensureLoaded() {
      if (!this._loaded) {
        this._loaded = true
        try {
          this.items = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
        } catch {
          this.items = []
        }
      }
    },

    getMistakes() {
      this._ensureLoaded()
      return this.items
    },

    addMistakes(newItems) {
      this._ensureLoaded()
      const idMap = new Map(this.items.map(item => [item.id, item]))
      for (const item of newItems) {
        if (!idMap.has(item.id)) {
          this.items.push(item)
        }
      }
      this._persist()
    },

    removeMistake(id) {
      this._ensureLoaded()
      this.items = this.items.filter(item => item.id !== id)
      this._persist()
    },

    clearAll() {
      this.items = []
      this._persist()
    },
  },
})
