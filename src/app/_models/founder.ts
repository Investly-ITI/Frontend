import { Status } from "../_shared/enums";
import { User } from "./user";

export class Founder
{
    constructor(
        public id: number,
        public userId: number,
       public user:User
    ) {}
}

export class FounderSearch
{
    constructor(
        public PageSize: number,
        public PageNumber: number,
       public SearchInput:string,
        public GovernmentId: number,
        public Gender:any,
        public status: number

    ) {}
}

export class ChangePassword {
    constructor(
        public email: string,
        public currentPassword: string,
        public newPassword: string,
        public confirmNewPassword: string
    ) {}
}
export class UpdateFounder {
    constructor(
        public firstName: string,
        public lastName: string,
        public phoneNumber: string | null,
        public gender: string | null,
        public governmentId: number | null,
        public cityId: number | null,
        public address: string | null,
        public dateOfBirth: Date | null
    ) {}

    equals(other: UpdateFounder | null): boolean {
        if (!other) return false;

        return this.firstName === other.firstName &&
               this.lastName === other.lastName &&
               this.phoneNumber === other.phoneNumber &&
               this.gender === other.gender &&
               this.governmentId === other.governmentId &&
               this.cityId === other.cityId &&
               this.address === other.address &&
               this.dateOfBirth === other.dateOfBirth;
    }
}


