import { BusinessIdeaStatus, Stage } from "../_shared/enums"; 

export class BusinessDto {
    constructor(
        public id: number,
        public founderId: number,
        public categoryId: number,
        public title: string,
        public airate?: number,
        public stage?: Stage, 
        public location?: string,
        public capital?: number,
        public isDrafted?: boolean,
        public filePath?: string,
        public status?: BusinessIdeaStatus, 
        public createdAt?: string, 
        public categoryName?: string,
        public founderName?: string
    ) { }
}

export class BusinessListDto {
    constructor(
        public businesses: BusinessDto[] = [], 
        public totalCount: number = 0
    ) { }
}

export class BusinessSearchDto {
    constructor(
        public pageSize: number = 10,
        public pageNumber: number = 1,
        public searchInput?: string,
        public categoryId?: number,
        public founderId?: number,
        public stage?: Stage ,

    ) { }
}

export class ResponseDto<T> {
    constructor(
        public data: T | null = null,
        public isSuccess: boolean = false,
        public message: string | null = null,
        public statusCode: number = 0
    ) { }
}