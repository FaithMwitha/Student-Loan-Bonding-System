import { StudentProfile } from './entities/student-profile.entity';

export function toStudentProfileResponse(p: StudentProfile) {
  return {
    manebId: p.manebId,
    registrationNumber: p.registrationNumber,
    university: p.university,
    programme: p.programme,
    yearOfStudy: p.yearOfStudy,
    phone: p.phone,
    bankName: p.bankName,
    bankAccount: p.bankAccountNumber ? `****${p.bankAccountNumber.slice(-4)}` : null,
  };
}