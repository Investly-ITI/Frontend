import { InvestorInvestingType, Status } from "../enums";

export function getStatusLabel(value:number):string{
return Status[value]??'UnKnown';
}

export function getInvestorInvestingTypeLabel(value:number):string{
return InvestorInvestingType[value]??'Unknown';
}