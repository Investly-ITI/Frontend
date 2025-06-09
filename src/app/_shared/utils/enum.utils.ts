import { InvestorInvestingType, Status, UserType,BusinessIdeaStatus ,InvestingStages } from "../enums";

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

export function getBusinessIdeaStatusLabel(value: number): string {
    return BusinessIdeaStatus[value] ?? 'Unknown';
}

export function getStageLabel(value: number): string {
    return InvestingStages[value] ?? 'Unknown';
}



