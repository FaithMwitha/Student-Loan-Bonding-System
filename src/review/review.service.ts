import { Injectable } from '@nestjs/common';

@Injectable()
export class ReviewService {
    getPendingApplications(){
        return[
            {id: 2, studentName:
       'student one', status:
        'SUBMITTED'},
        {id: 2, studentName:
        'student two', status:
        'SUBMITTED' },
        ];

        }
        approveApplication(id: number)
        {
            return{
                message: `Application ${id}
                approved succesfully`,
            };
        }
        rejectApplication(id: number, reason: string){
            return{
                message: `Application ${id}
                rejected`,
                reason: reason,

            };
        }
            }
            

