export interface RosterEntry {
  id: string;
  manebId: string;
  intakeYear: number;
  universityName: string;
  programme: string | null;
  yearOfStudy: number;
  firstNames: string;
  surname: string;
  dateOfBirth: string;
  gender: string;
  nationalIdNumber: string | null;
  registrationNumber: string | null;
}
