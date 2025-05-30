import { InvestorInvestingType } from "../_shared/enums";
import { getInvestorInvestingTypeLabel } from "../_shared/utils/enum.utils";
import { User } from "./user";

export class Investor {
    constructor(
    public id :number,
    public investingType:InvestorInvestingType,
    public userId:number,
    public user:User

    ){}

    
}

export class InvestorSearch{
    constructor(
        public PageSize:number,
        public SearchInput:string,
        public pageNumber:number,
        public governmentId:number,
        public gender:any
    ){}
}