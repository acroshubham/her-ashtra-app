// stores/useContactStore.ts
// Trusted-circle contacts, backed by the Her-Ashtra-API /api/contacts endpoints.
// Keeps the { contacts, selectedContact, setSelectedContact } selection surface
// that HomeHeader/Dropdown rely on, and adds async CRUD actions.
import { create } from "zustand";
import { apiFetch } from "@/lib/api";

export interface Contact {
  id: string;
  name: string;
  relation: string | null;
  email: string | null;
  phone: string | null;
}

export interface ContactInput {
  name: string;
  relation?: string;
  email: string;
  phone?: string;
}

interface ContactStore {
  contacts: Contact[];
  selectedContact: Contact | null;
  loading: boolean;
  error: string | null;
  setSelectedContact: (contact: Contact) => void;
  loadContacts: () => Promise<void>;
  addContact: (input: ContactInput) => Promise<Contact | null>;
  updateContact: (id: string, input: Partial<ContactInput>) => Promise<void>;
  removeContact: (id: string) => Promise<void>;
}

// Keep the current selection valid as the list changes (default to first).
function reconcileSelection(contacts: Contact[], current: Contact | null): Contact | null {
  if (contacts.length === 0) return null;
  const stillThere = current && contacts.find((c) => c.id === current.id);
  return stillThere ?? contacts[0];
}

export const useContactStore = create<ContactStore>((set, get) => ({
  contacts: [],
  selectedContact: null,
  loading: false,
  error: null,

  setSelectedContact: (contact) => set({ selectedContact: contact }),

  loadContacts: async () => {
    set({ loading: true, error: null });
    try {
      const contacts = await apiFetch<Contact[]>("/api/contacts");
      set((state) => ({
        contacts,
        selectedContact: reconcileSelection(contacts, state.selectedContact),
        loading: false,
      }));
    } catch (err) {
      set({ loading: false, error: (err as Error).message });
    }
  },

  addContact: async (input) => {
    try {
      const contact = await apiFetch<Contact>("/api/contacts", {
        method: "POST",
        body: JSON.stringify(input),
      });
      set((state) => {
        const contacts = [...state.contacts, contact];
        return { contacts, selectedContact: reconcileSelection(contacts, state.selectedContact) };
      });
      return contact;
    } catch (err) {
      set({ error: (err as Error).message });
      return null;
    }
  },

  updateContact: async (id, input) => {
    const updated = await apiFetch<Contact>(`/api/contacts/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    });
    set((state) => {
      const contacts = state.contacts.map((c) => (c.id === id ? updated : c));
      return {
        contacts,
        selectedContact:
          state.selectedContact?.id === id ? updated : state.selectedContact,
      };
    });
  },

  removeContact: async (id) => {
    await apiFetch<{ id: string }>(`/api/contacts/${id}`, { method: "DELETE" });
    set((state) => {
      const contacts = state.contacts.filter((c) => c.id !== id);
      return { contacts, selectedContact: reconcileSelection(contacts, state.selectedContact) };
    });
  },
}));
