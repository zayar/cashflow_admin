import { ApolloClient, ApolloLink, InMemoryCache, HttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import LocalStorageService from '../service/local_storage';

// Create an HttpLink to the GraphQL API (see .env.example)
const httpLink = new HttpLink({
    // Prefer relative `/query` so Firebase Hosting can proxy to Cloud Run.
    // Override via VITE_GRAPHQL_URI for local dev or other environments.
    uri: import.meta.env.VITE_GRAPHQL_URI ?? '/query',
});

// Set up the Authorization header using setContext
const authLink = setContext((_operation: any, { headers }: any) => {
    // Retrieve the token from localStorage (or any storage mechanism you're using)
    const token = LocalStorageService.getToken();

    let headerWithAuth = headers;
    if (token) {
        headerWithAuth = { ...headerWithAuth, ["token"]: token }
    }
    // Identify caller type for backend entitlement checks.
    headerWithAuth = { ...headerWithAuth, ["X-Client-App"]: "admin" };
    // Return the headers with the Authorization token
    return {
        headers: headerWithAuth
    };
});

// When the server returns errors and data is null/missing, Apollo cache throws
// "Missing field 'login' while writing result". Normalize so the cache gets { login: null }.
const loginErrorNormalizer = new ApolloLink((operation: any, forward: any) => {
    return forward(operation).map((response: any) => {
        if (operation.operationName !== 'Login') return response;
        const hasErrors = (response.errors?.length ?? 0) > 0;
        if (hasErrors && response.data == null) {
            return { ...response, data: { login: null } };
        }
        if (hasErrors && response.data != null && !('login' in response.data)) {
            return { ...response, data: { ...response.data, login: null } };
        }
        return response;
    });
});

// Create the Apollo Client
const client = new ApolloClient({
    link: authLink.concat(loginErrorNormalizer.concat(httpLink)),
    cache: new InMemoryCache(),
});

export default client;
