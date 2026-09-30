import type { User } from '../api/types';

// Only first names / initials appear in the design for most people; surnames
// other than Diego Ramírez, Luis Pérez and Laura Méndez are placeholders.
const created = '2026-01-12T09:00:00Z';

export const users: User[] = [
  { id: 'u-gm', email: 'gonzalo@questlog.dev', fullName: 'Gonzalo', role: 'admin', initials: 'GM', avatarColor: 'slate', jobTitle: 'CEO', createdAt: created },
  { id: 'u-lm', email: 'laura@questlog.dev', fullName: 'Laura Méndez', role: 'admin', initials: 'LM', avatarColor: 'slate', jobTitle: 'Producer', createdAt: created },
  { id: 'u-dr', email: 'diego@questlog.dev', fullName: 'Diego Ramírez', role: 'member', initials: 'DR', avatarColor: 'blue', jobTitle: 'Programación', createdAt: created },
  { id: 'u-st', email: 'sofia@questlog.dev', fullName: 'Sofía Torres', role: 'member', initials: 'ST', avatarColor: 'violet', jobTitle: 'Diseño', createdAt: created },
  { id: 'u-mr', email: 'marta@questlog.dev', fullName: 'Marta Ruiz', role: 'member', initials: 'MR', avatarColor: 'pink', jobTitle: 'Arte', createdAt: created },
  { id: 'u-vg', email: 'valeria@questlog.dev', fullName: 'Valeria Gómez', role: 'member', initials: 'VG', avatarColor: 'teal', jobTitle: 'Audio', createdAt: created },
  { id: 'u-ac', email: 'ana@questlog.dev', fullName: 'Ana Castro', role: 'member', initials: 'AC', avatarColor: 'orange', jobTitle: 'UI/UX', createdAt: created },
  { id: 'u-lp', email: 'luis@questlog.dev', fullName: 'Luis Pérez', role: 'member', initials: 'LP', avatarColor: 'red', jobTitle: 'QA', createdAt: created },
  { id: 'u-sf', email: 'santiago@questlog.dev', fullName: 'Santiago Flores', role: 'member', initials: 'SF', avatarColor: 'slate', jobTitle: 'Narrativa', createdAt: created },
];

/** The logged-in user. */
export const currentUserId = 'u-gm';
