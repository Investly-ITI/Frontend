// investor-contact.interfaces.ts

import { ContactRequestStatus } from "../_shared/enums";

export interface InvestorContactRequest {
  pageNumber?: number;
  pageSize?: number;
  investorIdFilter?: number;
  founderIdFilter?: number;
  statusFilter?: ContactRequestStatus;
  columnOrderBy?: string;
  orderByDirection?: 'ASC' | 'DESC';
  searchTerm?: string;
}

export interface InvestorContactItem {
  id: number;
  founderName: string;
  founderId: number;
  investorName: string;
  investorId: number;
  businessTitle: string;
  businessId: number;
  status: number;
  declineReason: string | null;
  createdAt: string | null;
}

export interface InvestorContactResponse {
  items: InvestorContactItem[];
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalFilteredItems: number;
  totalItemsInTable: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface UpdateContactRequestStatusDto {
  contactRequestId: number;
  newStatus: ContactRequestStatus;
  declineReason?: string;  
}