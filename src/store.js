import { create } from "zustand";

const STORAGE_KEY = "crayfish-mappings";

function loadFromStorage() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Failed to load from localStorage:", error);
  }
  return { people: [], relationships: [] };
}

function saveToStorage(state) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        people: state.people,
        relationships: state.relationships,
      }),
    );
  } catch (error) {
    console.error("Failed to save to localStorage:", error);
  }
}

export const useStore = create((set, get) => ({
  ...loadFromStorage(),
  toasts: [],
  compactMode: false,
  addPerson: (name, title, project = "") => {
    set((state) => {
      const newPerson = {
        id: crypto.randomUUID(),
        name,
        title,
        project,
        order: state.people.length,
        flagged: false,
      };
      const newState = {
        ...state,
        people: [...state.people, newPerson],
      };
      saveToStorage(newState);
      return newState;
    });
  },

  addPeople: (peopleData) => {
    set((state) => {
      const startOrder = state.people.length;
      const newPeople = peopleData.map((person, index) => ({
        id: crypto.randomUUID(),
        name: person.name,
        title: person.title,
        project: person.project || "",
        order: startOrder + index,
        flagged: false,
      }));

      const newRelationships = [...state.relationships];
      newPeople.forEach((person) => {
        if (person.project) {
          const allPeople = [...state.people, ...newPeople];
          const sameProjectPeople = allPeople.filter(
            (p) => p.project === person.project && p.id !== person.id,
          );
          sameProjectPeople.forEach((otherPerson) => {
            if (
              !newRelationships.some(
                (r) =>
                  r.reviewerId === person.id && r.revieweeId === otherPerson.id,
              )
            ) {
              newRelationships.push({
                reviewerId: person.id,
                revieweeId: otherPerson.id,
              });
            }
            if (
              !newRelationships.some(
                (r) =>
                  r.reviewerId === otherPerson.id && r.revieweeId === person.id,
              )
            ) {
              newRelationships.push({
                reviewerId: otherPerson.id,
                revieweeId: person.id,
              });
            }
          });
        }
      });

      const newState = {
        ...state,
        people: [...state.people, ...newPeople],
        relationships: newRelationships,
      };
      saveToStorage(newState);
      return newState;
    });
  },

  removePerson: (id) => {
    set((state) => {
      const newState = {
        ...state,
        people: state.people.filter((p) => p.id !== id),
        relationships: state.relationships.filter(
          (r) => r.reviewerId !== id && r.revieweeId !== id,
        ),
      };
      saveToStorage(newState);
      return newState;
    });
  },

  updatePerson: (id, updates) => {
    set((state) => {
      const newState = {
        ...state,
        people: state.people.map((p) =>
          p.id === id ? { ...p, ...updates } : p,
        ),
      };
      saveToStorage(newState);
      return newState;
    });
  },

  reorderPeople: (newOrderedArray) => {
    set((state) => {
      const peopleWithNewOrder = newOrderedArray.map((person, index) => ({
        ...person,
        order: index,
      }));
      const newState = {
        ...state,
        people: peopleWithNewOrder,
      };
      saveToStorage(newState);
      return newState;
    });
  },

  toggleRelationship: (reviewerId, revieweeId) => {
    if (reviewerId === revieweeId) return;

    set((state) => {
      const existingIndex = state.relationships.findIndex(
        (r) => r.reviewerId === reviewerId && r.revieweeId === revieweeId,
      );

      let newRelationships;
      if (existingIndex >= 0) {
        newRelationships = state.relationships.filter(
          (_, i) => i !== existingIndex,
        );
      } else {
        newRelationships = [...state.relationships, { reviewerId, revieweeId }];
      }

      const newState = {
        ...state,
        relationships: newRelationships,
      };
      saveToStorage(newState);
      return newState;
    });
  },

  addMutualRelationship: (reviewerId, revieweeId) => {
    if (reviewerId === revieweeId) return;

    set((state) => {
      const newRelationships = [...state.relationships];

      if (
        !newRelationships.some(
          (r) => r.reviewerId === reviewerId && r.revieweeId === revieweeId,
        )
      ) {
        newRelationships.push({ reviewerId, revieweeId });
      }

      if (
        !newRelationships.some(
          (r) => r.reviewerId === revieweeId && r.revieweeId === reviewerId,
        )
      ) {
        newRelationships.push({
          reviewerId: revieweeId,
          revieweeId: reviewerId,
        });
      }

      const newState = {
        ...state,
        relationships: newRelationships,
      };
      saveToStorage(newState);
      return newState;
    });
  },

  addRelationship: (reviewerId, revieweeId) => {
    if (reviewerId === revieweeId) return;

    set((state) => {
      if (
        state.relationships.some(
          (r) => r.reviewerId === reviewerId && r.revieweeId === revieweeId,
        )
      ) {
        return state;
      }

      const newState = {
        ...state,
        relationships: [...state.relationships, { reviewerId, revieweeId }],
      };
      saveToStorage(newState);
      return newState;
    });
  },

  removeRelationship: (reviewerId, revieweeId) => {
    set((state) => {
      const newState = {
        ...state,
        relationships: state.relationships.filter(
          (r) => !(r.reviewerId === reviewerId && r.revieweeId === revieweeId),
        ),
      };
      saveToStorage(newState);
      return newState;
    });
  },

  hasRelationship: (reviewerId, revieweeId) => {
    const state = get();
    return state.relationships.some(
      (r) => r.reviewerId === reviewerId && r.revieweeId === revieweeId,
    );
  },

  addToast: (message, type = "success") => {
    const id = Date.now();
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }],
    }));
    return id;
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },

  toggleCompactMode: () => {
    set((state) => ({
      compactMode: !state.compactMode,
    }));
  },

  togglePersonFlag: (id) => {
    set((state) => {
      const newState = {
        ...state,
        people: state.people.map((p) =>
          p.id === id ? { ...p, flagged: !p.flagged } : p,
        ),
      };
      saveToStorage(newState);
      return newState;
    });
  },
}));
