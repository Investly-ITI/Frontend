import {  Status, UserType } from "../_shared/enums";
import { City } from "./city";
import { Governorate } from "./governorate";

export class User {
    constructor(
        public id:number,
        public firstName:string,
        public lastName:string,
        public email:string,
        public HashedPassword:string,
        public phoneNumber:string,
        public userType:UserType,
        public nationalId:string,
        public gender:string,
        public dateOfBirth:Date,
        public frontIdPicPath:string,
        public backIdPicPath:string,
        public profilePicPath:string,
        public governmentId:number,
        public cityId:number,
        public address:string,
        public status:Status,
        public createdAt:Date,
        public createdBy:number,
        public updatedAt:Date,
        public updatedBy:number,
        public government:Governorate,
        public city:City,
        public countryCode?:string


    ){}

}

export class UserLogin{
    constructor(
        public email:string,
        public password:string
    ){}
}

export class LoggedInUser{
    constructor(

        public name:string,
        public email:string,
        public userType:UserType,
        public status:Status,
        public profilePicPath:string
    ){}
}


export interface DropdownDto {
  id: number;
  name: string;
}