import { ReactNode } from "react";
import { AuthProvider } from "./auth";
import { ThemeProvider } from "./theme";

export const ContextProvider = ({ children }: { children: ReactNode }) => {
    return (
        <AuthProvider>
            <ThemeProvider>
                {children}
            </ThemeProvider>
        </AuthProvider>
    );
};