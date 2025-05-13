import { create } from "zustand";
import { persist } from "zustand/middleware";

const useExamStore = create(
  persist(
    (set) => ({
      currentExamResults: null,
      examAnswers: {},
      examQuestions: [],
      examTimeSpent: 0,
      examDocumentId: null,

      saveExamResults: (results, answers, questions, timeSpent, documentId) => {
        set({
          currentExamResults: results,
          examAnswers: answers,
          examQuestions: questions,
          examTimeSpent: timeSpent,
          examDocumentId: documentId,
        });
      },

      clearExamResults: () => {
        set({
          currentExamResults: null,
          examAnswers: {},
          examQuestions: [],
          examTimeSpent: 0,
          examDocumentId: null,
        });
      },
    }),
    {
      name: "exam-storage",
    }
  )
);

export default useExamStore;
