import CryptoJS from "crypto-js";


export const AESdecrypt = (payload: string) => {
    const key = window.location.hostname;
    var bytes = CryptoJS.AES.decrypt(payload, key);
    var decryptedData = bytes.toString(CryptoJS.enc.Utf8);
    return decryptedData;
}

export const AESencrypt = (payload: string) => {
    const key = window.location.hostname;
    var ciphertext = CryptoJS.AES.encrypt(payload, key).toString();
    return ciphertext;
}
export const parseJson = (jsonStr: string) => {
    let result: any | undefined = undefined;
    try {
        result = JSON.parse(jsonStr);
    } catch (error) {
        console.error(error);
    }
    return result;
}