import { message } from 'antd';
import { createContext, ReactNode, useContext, useState } from 'react';
import client from '../gql/client';
import { login as loginQuery, loginVar } from '../gql/login';
import LocalStorageService from '../service/local_storage';
import { ApolloResult, LoginResp } from '../store';


interface AuthContextType {
    isAuthenticated: boolean;
    login: (username: string, password: string) => Promise<boolean>;
    logout: () => void;
}
// Create AuthContext with the correct type
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provide the context to your app
export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(LocalStorageService.getToken() ? true : false);
    const login = async (username: string, password: string) => {
        let success: boolean = false;
        const authResult = await client.mutate<ApolloResult<"login", LoginResp>>({
            mutation: loginQuery,
            variables: loginVar(username, password),
            // Keep errors for UI/console diagnostics.
            errorPolicy: "all",
        })
        if (authResult.data?.login && authResult.data.login.role === "Admin") {
            success = true;
            LocalStorageService.saveToken(authResult.data.login)
            setIsAuthenticated(true);
        } else {
            const msg = authResult.errors?.[0]?.message ?? 'Login failed. Please try again.'
            // Helpful for debugging in production.
            // eslint-disable-next-line no-console
            console.warn("Login failed", { username, errors: authResult.errors });
            message.error(msg)
        }
        return success;
    };
    const logout = () => {
        LocalStorageService.clear();
        setIsAuthenticated(false);
    };
    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use AuthContext
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
