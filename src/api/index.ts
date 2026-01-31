import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { writeDoc } from "../helper/fb";

// Create an Axios instance
const apiClient = axios.create({
    baseURL: "https://cashflow-judrztptdq-uc.a.run.app/v1",
    //timeout: 5000,                     // Request timeout (optional)
    headers: {
        "Content-Type": "application/json", // Default content type
    },
});

// Generic API request function
const apiRequest = async <T>(
    method: "GET" | "POST" | "PUT" | "DELETE",
    url: string,
    data?: Record<string, any>,
    config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> => {
    try {
        const response = await apiClient.request<T>({
            method,
            url,
            data,
            ...config, // Merge with additional config (e.g., headers, params)
        });
        return response;
    } catch (error: any) {
        if (axios.isAxiosError(error)) {
            // Handle Axios errors
            console.error("Axios error:", error.message);
        } else {
            // Handle other errors
            console.error("Unexpected error:", error);
        }
        throw error;
    }
};

// Wrapper methods for convenience
export const APIs = {
    get: <T>(url: string, config?: AxiosRequestConfig) =>
        apiRequest<T>("GET", url, undefined, config),

    post: <T>(url: string, data?: Record<string, any>, config?: AxiosRequestConfig) =>
        apiRequest<T>("POST", url, data, config),

    put: <T>(url: string, data?: Record<string, any>, config?: AxiosRequestConfig) =>
        apiRequest<T>("PUT", url, data, config),

    delete: <T>(url: string, config?: AxiosRequestConfig) =>
        apiRequest<T>("DELETE", url, undefined, config),
};



export const createPitiSetup = async (args: {
    merchantId: string,
    username: string,
    password: string,
    bizId: string,
}) => {
    let success = false;
    try {
        const apiResult = await APIs.post<{ success: boolean, data: any }>('/init', args, { headers: { ["Authorization"]: `cashflow,${args.merchantId}` } })
        if (apiResult.status === 200 && apiResult.data.data) {
            success = true;
            await writeDoc({
                docId: args.bizId,
                col: "piti_integrations",
                data: apiResult.data.data
            });
            const col = `piti_integrations/${args.bizId}/logs`;
            const docId = new Date().getTime().toString();
            await writeDoc({ docId, col, data: { type: "pull", result: apiResult.data } })
        }
    } catch (error) {
        console.error(error);
    }
    return success;
}


export const createPitiPull = async (args: { merchantId: string, bizId: string }) => {
    let success = false;
    try {
        const apiResult = await APIs.post<{ success: boolean, data: any }>('/pull', args, { headers: { ["Authorization"]: `cashflow,${args.merchantId}` } })
        if (apiResult.status === 200 && apiResult.data.data) {
            success = true;
            const col = `piti_integrations/${args.bizId}/logs`;
            const docId = new Date().getTime().toString();
            await writeDoc({
                docId,
                col,
                data: {
                    type: "pull",
                    result: apiResult.data
                }
            })
        }
    } catch (error) {
        console.error(error);
    }
    return success;
}


export const createPitiPush = async (args: { merchantId: string, bizId: string }) => {
    let success = false;
    try {
        const apiResult = await APIs.post<{ success: boolean, data: any }>('/push', args, { headers: { ["Authorization"]: `cashflow,${args.merchantId}` } })
        if (apiResult.status === 200 && apiResult.data.data) {
            success = true;
            const col = `piti_integrations/${args.bizId}/logs`;
            const docId = new Date().getTime().toString();
            await writeDoc({
                docId,
                col,
                data: {
                    type: "push",
                    result: apiResult.data
                }
            })
        }
    } catch (error) {
        console.error(error);
    }
    return success;
}

export const createPitiSchedule = async (args: {
    merchantId: string,
    bizId: string
    name: string,
    taskId: "syncitems2" | "synctopiti",
    intervalType: "hourly" | "daily",
    intervalValue: 1,
    status: "Active" | "Paused" | "Completed"
}) => {
    let success = false;
    try {
        const apiResult = await APIs.post<{ success: boolean, data: any }>('/schedule', args, { headers: { ["Authorization"]: `cashflow,${args.merchantId}` } })
        if (apiResult.status === 200 && apiResult.data.data) {
            success = true;
            const col = `piti_integrations/${args.bizId}/logs`;
            const docId = new Date().getTime().toString();
            await writeDoc({ docId, col, data: { type: "schedule", result: apiResult.data } });
            await writeDoc({
                docId: args.bizId,
                col: "piti_integrations",
                data: {
                    schedule: {
                        [args.taskId]: apiResult.data.data
                    }
                }
            });
        }
    } catch (error) {
        console.error(error);
    }
    return success;
}




