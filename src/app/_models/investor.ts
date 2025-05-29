import { InvestorInvestingType } from "../_shared/enums";
import { getInvestorInvestingTypeLabel } from "../_shared/utils/enum.utils";
import { User } from "./user";

export class Investor {
    constructor(
    public Id :number,
    public InvestorInvestingType:InvestorInvestingType,
    public UserId:number,
    public User:User

    ){}

    get InvestorInvestingTypeLabel():string{
       return getInvestorInvestingTypeLabel(this.InvestorInvestingType);
    }
}
