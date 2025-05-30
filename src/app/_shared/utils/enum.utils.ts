import { InvestorInvestingType, Status, UserType } from "../enums";

export function getStatusLabel(value:number):string{
    console.log(Status[value]);
return Status[value]??'UnKnown';
}

export function getInvestorInvestingTypeLabel(value:number):string{
return InvestorInvestingType[value]??'Unknown';
}

export function getUserTypeLabel(value:number):string{
    return UserType[value]??'unknown';
}

