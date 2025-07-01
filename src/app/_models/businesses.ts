import { BusinessIdeaStatus, InvestingStages } from "../_shared/enums"; 
import { StandardAnswers } from "./standardanswers";
import { Standard } from "./standards";

export interface CityDto {
    id: number;
    govId: number;
    nameAr: string;
    nameEn: string;
}

export interface GovernmentDto {
    id: number;
    nameAr: string;
    nameEn: string;
}

export class BusinessDto {
    constructor(
        public id: number,
        public founderId: number,
        public founderName?: string,
        public categoryId?: number,
        public categoryName?: string,
        public title?: string,
        public airate?: number,
        public stage?: InvestingStages, 
        public location?: string,
        public capital?: number,
        public isDrafted?: boolean,
        public filePath?: string,
        public status?: BusinessIdeaStatus,
        public rejectedReason?: string,
        public createdAt?: string, 
        public createdBy?: number,
        public updatedBy?: number,
        public updatedAt?: string,
        public ideaFile?: any,
        public governmentId?: number,
        public cityId?: number,
        public description?: string,
        public desiredInvestmentType?: number,
        public desiredInvestmentTypeName?: string,
        public businessStandardAnswers: StandardAnswers[] = [],
        public city?: CityDto,
        public government?: GovernmentDto,
        public images?:string[],
        public imageFiles?:any
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
        public search?: string,
        public categoryId?: number,
        public founderId?: number,
        public stage?: InvestingStages,
        public status?: BusinessIdeaStatus
    ) { }
}
