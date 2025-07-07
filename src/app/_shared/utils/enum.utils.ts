import { InvestorInvestingType, Status, UserType,BusinessIdeaStatus ,InvestingStages } from "../enums";
import {FeedbackTargetType } from "../../_models/feedback";

export function getStatusLabel(value:number):string{
    // console.log(Status[value]);
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
export function getFeedbackTargetTypeLabel(value: number): string {
  return FeedbackTargetType[value] ?? 'Unknown';
}


