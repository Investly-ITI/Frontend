
export class FeedbackDto {
    constructor(
        public id: number,
        public subject: string,
        public description?: string,
        public userIdTo?: number,
        public status?: number,  
        public createdAt?: string,
        public userTypeFromName?: string,
        public userTypeToName?: string,
        public userToName?: string,
        public userFromName?: string

    ) { }
}

export class FeedbackListDto {
    constructor(
        public list: FeedbackDto[] = [],
        public totalCount: number = 0
    ) { }
}

export class FeedbackSearchDto {
    constructor(
        public pageSize: number = 10,
        public pageNumber: number = 1,
        public searchInput?: string,
        public statusFilter?: number,
        public userTypeFromFilter?: number,
        public userTypeToFilter?: number
    ) { }
}

export class FeedbackCountsDto {
    constructor(
        public totalActive: number = 0,
        public totalInactive: number = 0
    ) { }
}