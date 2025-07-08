import { BusinessIdeaStatus, InvestingStages, ContactRequestStatus } from "../_shared/enums"; 
import { AiIdeaEvaluationResult } from "./aiIdeaEvaluationResult";
import { ContactRequestCountsDto, InvestorContactItem } from "./contact-request";
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
        public images?: string | string[],
        public imageFiles?:any,
        public aiBusinessEvaluations?:AiIdeaEvaluationResult,
        public imagePaths?:string[],
        public investorContactRequests?:InvestorContactItem[],
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

export class BusinessExploreDto {
    constructor(
        public id: number,
        public title: string,
        public description: string,
        public stage: number,
        public founderName: string,
        public categoryName: string,
        public governmentName: string,
        public capital: number,
        public airate: number,
        public desiredInvestmentType: number,
        public images: string[],
        public contactRequestStatus: ContactRequestStatus | null,
        public canRequestContact: boolean
    ) { }
}

export class BusinessSearchRequest {
    constructor(
        public pageSize: number,
        public pageNumber: number,
        public useDefaultPreferences: boolean,
        public searchInput?: string,
        public categoryId?: number,
        public stage?: InvestingStages,
        public governmentId?: number,
        public minCapital?: number | null,
        public maxCapital?: number | null,
        public minAiRate?: number,
        public desiredInvestmentType?: number | null
    ) { }
}

export class InvestorPreferences {
    constructor(
        public id: number,
        public investorId: number,
        public preferredCategories?: number[],
        public preferredStages?: InvestingStages[],
        public preferredGovernments?: number[],
        public minCapital?: number,
        public maxCapital?: number,
        public minAiRate?: number
    ) { }
}

export class InvestorPreferencesApiResponse {
    constructor(
        public interestedBusinessStages: string, // comma-separated string like "1,2,3"
        public minFunding: number,
        public maxFunding: number,
        public investingType: number
    ) { }
}
