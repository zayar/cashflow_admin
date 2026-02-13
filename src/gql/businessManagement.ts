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

export const RESET_PASSWORD_USER = gql`
  mutation ResetPasswordUser($businessId: String!) {
    resetPasswordUser(businessId: $businessId) {
      username
      tempPassword
    }
  }
`;

export const LIST_BUSINESS_SUBSCRIPTION_OVERVIEWS = gql`
  query ListBusinessSubscriptionOverviews {
    listBusinessSubscriptionOverviews {
      businessId
      businessName
      plan
      startsAt
      endsAt
      status
      allowedClients
      updatedAt
    }
  }
`;

export const GET_BUSINESS_ENTITLEMENT = gql`
  query GetBusinessEntitlement($businessId: String) {
    getBusinessEntitlement(businessId: $businessId) {
      businessId
      plan
      startsAt
      endsAt
      status
      allowedClients
    }
  }
`;

export const UPSERT_BUSINESS_SUBSCRIPTION = gql`
  mutation UpsertBusinessSubscription($input: UpsertBusinessSubscriptionInput!) {
    upsertBusinessSubscription(input: $input) {
      businessId
      plan
      startsAt
      endsAt
      status
      allowedClients
    }
  }
`;

export const EXTEND_BUSINESS_SUBSCRIPTION = gql`
  mutation ExtendBusinessSubscription($input: ExtendBusinessSubscriptionInput!) {
    extendBusinessSubscription(input: $input) {
      businessId
      plan
      startsAt
      endsAt
      status
      allowedClients
    }
  }
`;

export const CANCEL_BUSINESS_SUBSCRIPTION = gql`
  mutation CancelBusinessSubscription($businessId: String!) {
    cancelBusinessSubscription(businessId: $businessId) {
      businessId
      plan
      startsAt
      endsAt
      status
      allowedClients
    }
  }
`;
