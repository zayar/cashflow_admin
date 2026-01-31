// localStorageService.ts

import { AESdecrypt, AESencrypt, parseJson } from "../helper/utils";
import { LoginResp } from "../store";

class LocalStorageService {
  // Set an item in local storage
  static setItem(key: string, value: any): void {
    const item = JSON.stringify(value);
    localStorage.setItem(key, item);
  }

  static setItemStr(key: string, value: string): void {
    localStorage.setItem(key, value);
  }

  // Get an item from local storage
  static getItem<T>(key: string): T | null {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  }
  static getValue(key: string): string | null {
    return localStorage.getItem(key) ?? null;
  }
  // Remove an item from local storage
  static removeItem(key: string): void {
    localStorage.removeItem(key);
  }

  // Clear all local storage items
  static clear(): void {
    localStorage.clear();
  }

  static getToken(): string | null {
    const jsonStr = this.getValue("_i2_");
    if (jsonStr) {
      const result = parseJson(AESdecrypt(jsonStr)) as LoginResp;
      if (result) {
        const { token, expireAt = 0 } = result;
        const currentTime = new Date().getTime();
        if (expireAt > currentTime) {
          return token
        }
      }
    }
    return null;
  }
  static saveToken(payload: LoginResp): void {
    const currentTime = new Date().getTime()
    const expireAt = currentTime + (10 * 60 * 60 * 1000);
    const i2 = AESencrypt(JSON.stringify({ ...payload, expireAt }));
    LocalStorageService.setItemStr("_i2_", i2)
  }
}

export default LocalStorageService;
