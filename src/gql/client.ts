import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import LocalStorageService from '../service/local_storage';

// Create an HttpLink to the GraphQL API (see .env.example)
const httpLink = new HttpLink({
    uri: import.meta.env.VITE_GRAPHQL_URI ?? 'https://api-dev.thecashflow.app/query',
});

// Set up the Authorization header using setContext
const authLink = setContext((_, { headers }) => {
    // Retrieve the token from localStorage (or any storage mechanism you're using)
    const token = LocalStorageService.getToken();

    let headerWithAuth = headers;
    if (token) {
        headerWithAuth = { ...headerWithAuth, ["token"]: token }
    }
    // Return the headers with the Authorization token
    return {
        headers: headerWithAuth
    };
});

// Create the Apollo Client
const client = new ApolloClient({
    link: authLink.concat(httpLink), // Combine authLink with httpLink
    cache: new InMemoryCache(),       // Set up cache
});

export default client;
