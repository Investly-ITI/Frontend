import { StandardAnswers } from "./standardanswers";
import { User } from "./user";

export class Standard {
constructor( 
    public id: number,
  public name: string,
  public formQuestion: string,
  public status: number,
  public createdBy: number,
  public createdAt: Date,
  public updatedBy: number,
  public updatedAt: Date,
  public BusinessStandardAnswers:StandardAnswers[],
  public createdByNavigation: User,
  public updatedByNavigation: User
) {}
}
