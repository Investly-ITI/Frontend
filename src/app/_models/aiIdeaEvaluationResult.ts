export class AiIdeaEvaluationResult{
    constructor(
     public businessId:number,
     public generalFeedback:string,   
     public totalWeightedScore:number,
     public standards:StandardAiResult[]|null
    ){}
}

export class StandardAiResult{
    constructor(
     public CategoryStandard:number,   
     public name:string,
     public weight:number,
     public achievementScore:number,
     public weightedContribution:number,
     public standardCategoryId:number,
     public feedback:string
    ){}
}