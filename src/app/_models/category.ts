export class StandardCategoryDto {
  id: number = 0;
  standardName: string = '';
  question: string = '';
  standardId: number = 0;
  standardCategoryWeight: number = 0;
}

export class Category {
  id: number = 0;
  name: string = '';
  status: number = 0;
  standardCategoryDto: StandardCategoryDto[] = [];
}

export class CategoryPaginatedResponse {
  items: Category[] = [];
  totalCount: number = 0;
  pageSize: number = 0;
  currentPage: number = 0;
}

export class CategoryApiResponse {
  data: CategoryPaginatedResponse = new CategoryPaginatedResponse();
  isSuccess: boolean = false;
  message: string = '';
  statusCode: number = 0;
  refreshTokenRequired: boolean = false;
}

export class CategorySearch {
  pageNumber: number = 1;
  PageSize: number = 5;
  SearchInput: string = '';
  status: number = 0;
}

export class AddCategoryStandard {
  standardName: string = '';
  formQuestion: string = '';
  weight: number = 0;
}

export class AddCategoryWithStandards {
  name: string = '';
  standards: AddCategoryStandard[] = [];
}

export class UpdateCategoryStandard {
  standardId?: number; // nullable - if provided means editing existing, if null means new
  standardName: string = '';
  formQuestion: string = '';
  weight: number = 0;
  isDeleted: boolean = false;
}

export class UpdateCategoryWithStandards {
  id: number = 0;
  name: string = '';
  standards: UpdateCategoryStandard[] = [];
}


