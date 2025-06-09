export class Response<T>{
    constructor(
     public data:T,
     public isSuccess:boolean,
     public message:string,
     public statusCode:number
    ){}
}
