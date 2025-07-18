export class AiIdeaEvaluationResult{
    constructor(
     public businessId:number,
     public generalFeedback:string,   
     public totalWeightedScore:number|null,
     public standards:StandardAiResult[]|null
    ){}
}

export class StandardAiResult{
    constructor( 
     public name:string,
     public weight:number,
     public achievementScore:number,
     public weightedContribution:number,
     public standardCategoryId:number,
     public feedback:string
    ){}
}