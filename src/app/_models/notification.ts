import { User } from "./user";

export class notification
{
    constructor(
    public id: number,
    public title:string,
    public body:string,
    public userTypeFrom:number,
    public userTypeTo:number,
    public userIdTo:number,
    public isRead:number,
    public status: number,
    public createdAt: Date,
    public createdBy: number,
    public createdByNavigation:User,
    public userIdToNavigation:User,
    public updatedByNavigation:User,
    ){}
}
export class notificationSearch
{
    constructor(
    public PageSize:number,
   public PageNumber:number,
    public UserTypeFrom:number,
    public UserTypeTo:number,
    public SearchInput:string,
    public isRead:any,
    public Status: number,
   
    ){}
}
export class sendnotification
{
    constructor(
    public title:string,
    public body:string,
    public userTypeTo:number,
    public userIdTo:number,
    
    ){}
}