import { Gender, Status, UserType } from "../_shared/enums";
import { getStatusLabel } from "../_shared/utils/enum.utils";

export class User {
    constructor(
        public id:number,
        public firstName:string,
        public fastName:string,
        public email:string,
        public HashedPassword:string,
        public phoneNumber:string,
        public userType:UserType,
        public nationalId:string,
        public gender:boolean,
        public dateOfBirth:Date,
        public frontIdPicPath:string,
        public backIdPicPath:string,
        //public profileIdPicPath:string,
        public governmentId:number,
        public cityId:number,
        public status:Status,
        public createdAt:Date,
        public createdBy:number,
        public updatedAt:Date,
        public updatedBy:number


    ){}

}

