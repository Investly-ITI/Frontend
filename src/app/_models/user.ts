import { Status } from "../_shared/enums";
import { getStatusLabel } from "../_shared/utils/enum.utils";

export class User {
    constructor(
        public Id:number,
        public FirstName:string,
        public LastName:string,
        public Email:string,
        public status:Status,

    ){}

    get StatusLabel():string{
        return getStatusLabel(this.status)
    }
}

