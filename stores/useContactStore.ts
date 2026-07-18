// stores/useContactStore.ts
// Sample zustand store demonstrating the selection pattern used by
// components/common/Dropdown - swap the seed data and add a Supabase-backed
// `loadContacts` action once a real "trusted circle" table exists.
import { create } from "zustand";

export interface Contact {
  id: string;
  name: string;
  relation: string;
  phone: string;
}

interface ContactStore {
  contacts: Contact[];
  selectedContact: Contact | null;
  setSelectedContact: (contact: Contact) => void;
  addContact: (contact: Contact) => void;
}

const SEED_CONTACTS: Contact[] = [
  { id: "1", name: "Mom", relation: "Parent", phone: "+91 90000 00001" },
  { id: "2", name: "Riya Sharma", relation: "Best Friend", phone: "+91 90000 00002" },
  { id: "3", name: "Campus Security", relation: "Guardian Network", phone: "+91 90000 00003" },
];

export const useContactStore = create<ContactStore>((set) => ({
  contacts: SEED_CONTACTS,
  selectedContact: SEED_CONTACTS[0],
  setSelectedContact: (contact) => set({ selectedContact: contact }),
  addContact: (contact) =>
    set((state) => ({ contacts: [...state.contacts, contact] })),
}));
