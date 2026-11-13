import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { LoanApplication } from './entities/loan-application.entity';
import { CreateLoanApplicationDto } from './dto/create-loan-application.dto';
import { FilterLoansDto } from './dto/filter-loans.dto'; 
import { ApplicationStatus } from './enums/application-status.enum';
import { FundingType } from './enums/funding-type.enum';
import { StudentProfile } from '../../profile/src/entities/student-profile.entity';
import { UsersService } from '../../users/src/users.service';
import { UniversitiesService } from '../../universities/src/universities.service';

@Injectable()
export class LoansService {
  constructor(
    @InjectRepository(LoanApplication)
    private readonly loanRepo: Repository<LoanApplication>,
    
    @InjectRepository(StudentProfile)
    private readonly profileRepo: Repository<StudentProfile>,

    private readonly usersService: UsersService,
    private readonly universitiesService: UniversitiesService,
  ) {}

  async create(studentId: string, dto: CreateLoanApplicationDto, documentPaths: string[] = []) {
    const profile = await this.profileRepo.findOne({ where: { userId: studentId } });
    if (!profile) {
      throw new ForbiddenException('You must complete student registration before applying for a loan.');
    }

    const existingLoanForYear = await this.loanRepo.findOne({
      where: {
        studentId: studentId,
        yearOfStudy: dto.yearOfStudy,
        status: Not(ApplicationStatus.REJECTED),
      },
    });

    if (existingLoanForYear) {
      throw new BadRequestException(
        `You already have an active or completed loan application for Year ${dto.yearOfStudy}. You cannot apply again for the same year.`
      );
    }

//     if (dto.yearOfStudy > 1) {
//       const previousYearLoan = await this.loanRepo.findOne({
//         where: {
//           studentId: studentId,
//           yearOfStudy: dto.yearOfStudy - 1,
//           status: Not(ApplicationStatus.REJECTED),
//         },
//       });
// 
//       if (!previousYearLoan) {
//         throw new BadRequestException(
//           `You cannot apply for Year ${dto.yearOfStudy} because you have not yet applied for Year ${dto.yearOfStudy - 1}. You must apply sequentially.`
//         );
//       }
//     }

    const university = await this.universitiesService.findOneByName(profile.university);

    const UPKEEP_AMOUNT = 560000;
    const fixedTuition = university.tuitionFee;
    
    let finalAmount = 0;

    if (dto.fundingType === FundingType.TUITION) {
      finalAmount = fixedTuition;
    } else if (dto.fundingType === FundingType.UPKEEP) {
      finalAmount = UPKEEP_AMOUNT;
    } else if (dto.fundingType === FundingType.BOTH) {
      finalAmount = fixedTuition + UPKEEP_AMOUNT;
    }

    let formattedDate: Date | undefined = undefined;
    if (dto.dateOfBirth) {
      const [day, month, year] = dto.dateOfBirth.split('/');
      formattedDate = new Date(`${year}-${month}-${day}`);
    }

    if (documentPaths.length !== 6) {
      throw new BadRequestException('You must upload exactly 6 documents for every new loan application.');
    }

    const loan = this.loanRepo.create({
      ...dto,
      dateOfBirth: formattedDate,
      documents: documentPaths,
      studentId,
      university: profile.university,
      programme: profile.programme ?? undefined,
      amountRequested: finalAmount, 
      status: ApplicationStatus.PENDING_PAYMENT,
    });
    
    const savedLoan = await this.loanRepo.save(loan);
    const user = await this.usersService.findById(studentId);

    return {
      ...savedLoan,
      applicantName: user.name,
    };
  }

  async getPreviousDetails(studentId: string) {
    const lastLoan = await this.loanRepo.findOne({
      where: { studentId },
      order: { createdAt: 'DESC' },
    });

    if (!lastLoan) {
      throw new NotFoundException('You have not applied for a loan before. Please fill out the form from scratch.');
    }

    return {
      nationalId: lastLoan.nationalId,
      gender: lastLoan.gender,
      maritalStatus: lastLoan.maritalStatus,
      dateOfBirth: lastLoan.dateOfBirth,
      phoneNumber: lastLoan.phoneNumber,
      postalAddress: lastLoan.postalAddress,
      guarantorName: lastLoan.guarantorName,
      guarantorPhone: lastLoan.guarantorPhone,
      guarantorAddress: lastLoan.guarantorAddress,
      nextOfKinName: lastLoan.nextOfKinName,
      nextOfKinPhone: lastLoan.nextOfKinPhone,
      bankName: lastLoan.bankName,
      bankAccountName: lastLoan.bankAccountName,
      bankAccountNumber: lastLoan.bankAccountNumber,
      bankBranch: lastLoan.bankBranch,
      personalStatement: lastLoan.personalStatement,
      previousDocuments: lastLoan.documents,
    };
  }

  async findMyApplications(studentId: string, filterDto: FilterLoansDto) {
    const { status, fundingType, university, search, page = 1, limit = 20 } = filterDto;

    const queryBuilder = this.loanRepo.createQueryBuilder('loan')
      .where('loan.studentId = :studentId', { studentId });

    if (status) {
      queryBuilder.andWhere('loan.status = :status', { status });
    }

    if (fundingType) {
      queryBuilder.andWhere('loan.fundingType = :fundingType', { fundingType });
    }

    if (university) {
      queryBuilder.andWhere('loan.university = :university', { university });
    }

    if (search) {
      queryBuilder.andWhere(
        '(CAST(loan.id AS text) ILIKE :search OR loan.nationalId ILIKE :search)', 
        { search: `%${search}%` }
      );
    }

    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);
    queryBuilder.orderBy('loan.createdAt', 'DESC');

    const loans = await queryBuilder.getMany();
    const user = await this.usersService.findById(studentId);

    return loans.map((loan) => ({
      ...loan,
      applicantName: user.name,
    }));
  }

  async findOne(id: string, studentId: string) {
    const loan = await this.loanRepo.findOne({
      where: { id, studentId },
    });
    if (!loan) {
      throw new NotFoundException('Loan application not found');
    }

    const user = await this.usersService.findById(studentId);

    return {
      ...loan,
      applicantName: user.name,
    };
  }

  async updateApplication(id: string, studentId: string, dto: Partial<CreateLoanApplicationDto>) {
    const existingLoan = await this.loanRepo.findOne({ where: { id, studentId } });
    
    if (!existingLoan) {
      throw new NotFoundException('Loan application not found');
    }

    if (
      existingLoan.status === ApplicationStatus.UNDER_REVIEW || 
      existingLoan.status === ApplicationStatus.APPROVED || 
      existingLoan.status === ApplicationStatus.REJECTED
    ) {
      throw new BadRequestException('Cannot update an application that is already under review or finalized.');
    }

    const safeDto = dto || {};

    if (safeDto.yearOfStudy !== undefined && safeDto.yearOfStudy !== existingLoan.yearOfStudy) {
      const duplicateYear = await this.loanRepo.findOne({
        where: {
          studentId: studentId,
          yearOfStudy: safeDto.yearOfStudy,
          status: Not(ApplicationStatus.REJECTED),
          id: Not(existingLoan.id),
        },
      });

      if (duplicateYear) {
        throw new BadRequestException(
          `You already have an active loan application for Year ${safeDto.yearOfStudy}. You cannot change this application to a year you have already applied for.`
        );
      }

//       if (safeDto.yearOfStudy > 1) {
//         const previousYearLoan = await this.loanRepo.findOne({
//           where: {
//             studentId: studentId,
//             yearOfStudy: safeDto.yearOfStudy - 1,
//             status: Not(ApplicationStatus.REJECTED),
//             id: Not(existingLoan.id),
//           },
//         });
// 
//         if (!previousYearLoan) {
//           throw new BadRequestException(
//             `You cannot change this application to Year ${safeDto.yearOfStudy} because you have not yet applied for Year ${safeDto.yearOfStudy - 1}.`
//           );
//         }
//       }
    }

    if (safeDto.nationalId !== undefined) existingLoan.nationalId = safeDto.nationalId;
    if (safeDto.gender !== undefined) existingLoan.gender = safeDto.gender;
    if (safeDto.maritalStatus !== undefined) existingLoan.maritalStatus = safeDto.maritalStatus;
    
    if (safeDto.dateOfBirth !== undefined) {
      const [day, month, year] = safeDto.dateOfBirth.split('/');
      const parsedDate = new Date(`${year}-${month}-${day}`);
      
      if (!isNaN(parsedDate.getTime())) {
        existingLoan.dateOfBirth = parsedDate;
      }
    }
    
    if (safeDto.phoneNumber !== undefined) existingLoan.phoneNumber = safeDto.phoneNumber;
    if (safeDto.postalAddress !== undefined) existingLoan.postalAddress = safeDto.postalAddress;
    if (safeDto.guarantorName !== undefined) existingLoan.guarantorName = safeDto.guarantorName;
    if (safeDto.guarantorPhone !== undefined) existingLoan.guarantorPhone = safeDto.guarantorPhone;
    if (safeDto.guarantorAddress !== undefined) existingLoan.guarantorAddress = safeDto.guarantorAddress;
    if (safeDto.nextOfKinName !== undefined) existingLoan.nextOfKinName = safeDto.nextOfKinName;
    if (safeDto.nextOfKinPhone !== undefined) existingLoan.nextOfKinPhone = safeDto.nextOfKinPhone;
    if (safeDto.bankName !== undefined) existingLoan.bankName = safeDto.bankName;
    if (safeDto.bankAccountName !== undefined) existingLoan.bankAccountName = safeDto.bankAccountName;
    if (safeDto.bankAccountNumber !== undefined) existingLoan.bankAccountNumber = safeDto.bankAccountNumber;
    if (safeDto.bankBranch !== undefined) existingLoan.bankBranch = safeDto.bankBranch;
    if (safeDto.yearOfStudy !== undefined) existingLoan.yearOfStudy = safeDto.yearOfStudy;
    if (safeDto.personalStatement !== undefined) existingLoan.personalStatement = safeDto.personalStatement;

    if (safeDto.fundingType !== undefined && safeDto.fundingType !== existingLoan.fundingType) {
      const university = await this.universitiesService.findOneByName(existingLoan.university || '');
      const UPKEEP_AMOUNT = 560000;
      const fixedTuition = university.tuitionFee;

      existingLoan.fundingType = safeDto.fundingType;

      if (safeDto.fundingType === FundingType.TUITION) {
        existingLoan.amountRequested = fixedTuition;
      } else if (safeDto.fundingType === FundingType.UPKEEP) {
        existingLoan.amountRequested = UPKEEP_AMOUNT;
      } else if (safeDto.fundingType === FundingType.BOTH) {
        existingLoan.amountRequested = fixedTuition + UPKEEP_AMOUNT;
      }
    }

    const savedLoan = await this.loanRepo.save(existingLoan);
    const user = await this.usersService.findById(studentId);

    return {
      ...savedLoan,
      applicantName: user.name,
    };
  }
}