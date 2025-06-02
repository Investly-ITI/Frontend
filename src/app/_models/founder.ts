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