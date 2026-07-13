import { defineStore } from 'pinia'

const STORAGE_KEY = 'n1-exam-bookmarks'

export const useBookmarkStore = defineStore('bookmark', {
  state: () => ({
    ids: [],
    _loaded: false,
  }),

  getters: {
    bookmarkIds(state) {
      if (!state._loaded) {
        state._loaded = true
        try {
          state.ids = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
        } catch {
          state.ids = []
        }
      }
      return new Set(state.ids)
    },
  },

  actions: {
    _persist() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.ids))
    },

    _ensureLoaded() {
      if (!this._loaded) {
        this._loaded = true
        try {
          this.ids = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
        } catch {
          this.ids = []
        }
      }
    },

    getBookmarks() {
      this._ensureLoaded()
      return [...this.ids]
    },

    isBookmarked(id) {
      this._ensureLoaded()
      return this.ids.includes(id)
    },

    addBookmark(question) {
      this._ensureLoaded()
      if (!this.isBookmarked(question.id)) {
        this.ids.push(question.id)
        this._persist()
      }
    },

    removeBookmark(id) {
      this._ensureLoaded()
      this.ids = this.ids.filter(i => i !== id)
      this._persist()
    },

    toggleBookmark(question) {
      this._ensureLoaded()
      if (this.isBookmarked(question.id)) {
        this.removeBookmark(question.id)
        return false
      } else {
        this.addBookmark(question)
        return true
      }
    },

    clearAll() {
      this.ids = []
      this._persist()
    },
  },
})
