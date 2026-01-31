import { gql } from "@apollo/client";

export const LIST_ALL_BUSINESSES = gql`
  query ListAllBusiness {
    listAllBusiness {
      id
      name
      email
      isActive
      country
      city
      address
      logoUrl
    }
  }
`;

export const GET_BUSINESS_ADMIN = gql`
  query GetBusinessAdmin($id: String!) {
    getBusinessAdmin(id: $id) {
      id
      name
      email
      isActive
      country
      city
      address
      phone
      mobile
      website
      companyId
      taxId
      fiscalYear
      reportBasis
      timezone
      migrationDate
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_BUSINESS = gql`
  mutation CreateBusiness($input: NewBusiness!) {
    createBusiness(input: $input) {
      id
      name
      email
      isActive
      createdAt
    }
  }
`;

export const TOGGLE_ACTIVE_BUSINESS = gql`
  mutation ToggleActiveBusiness($id: UUID!, $isActive: Boolean!) {
    toggleActiveBusiness(id: $id, isActive: $isActive) {
      id
      isActive
      updatedAt
    }
  }
`;

