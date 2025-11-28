
// services/mpesaService.ts

// Configuration - In a real app, these should be environment variables
const MPESA_CONFIG = {
    // Keys provided in documentation
    PUBLIC_KEY: "MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAmptSWqV7cGUUJJhUBxsMLonux24u+FoTlrb+4Kgc6092JIszmI1QUoMohaDDXSVueXx6IXwYGsjjWY32HGXj1iQhkALXfObJ4DqXn5h6E8y5/xQYNAyd5bpN5Z8r892B6toGzZQVB7qtebH4apDjmvTi5FGZVjVYxalyyQkj4uQbbRQjgCkubSi45Xl4CGtLqZztsKssWz3mcKncgTnq3DHGYYEYiKq0xIj100LGbnvNz20Sgqmw/cH+Bua4GJsWYLEqf/h/yiMgiBbxFxsnwZl0im5vXDlwKPw+QnO2fscDhxZFAwV06bgG0oEoWm9FnjMsfvwm0rUNYFlZ+TOtCEhmhtFp+Tsx9jPCuOd5h2emGdSKD8A6jtwhNa7oQ8RtLEEqwAn44orENa1ibOkxMiiiFpmmJkwgZPOG/zMCjXIrrhDWTDUOZaPx/lEQoInJoE2i43VN/HTGCCw8dKQAwg0jsEXau5ixD0GUothqvuX3B9taoeoFAIvUPEq35YulprMM7ThdKodSHvhnwKG82dCsodRwY428kg2xM/UjiTENog4B6zzZfPhMxFlOSFX4MnrqkAS+8Jamhy1GgoHkEMrsT5+/ofjCx0HjKbT5NuA2V/lmzgJLl3jIERadLzuTYnKGWxVJcGLkWXlEPYLbiaKzbJb2sYxt+Kt5OxQqC1MCAwEAAQ==",
    API_KEY: "z2b2rnv866shj4i89vmjfrs11yy0wx8t",
    // Sandbox URL placeholder
    RESOURCE_URL: "https://api.sandbox.vm.co.mz:18352/ipg/v1x/c2bPayment/singleStage" 
};

class MpesaService {
    /**
     * Converts a Base64 string to an ArrayBuffer
     */
    private base64ToArrayBuffer(base64: string): ArrayBuffer {
        const binaryString = window.atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    }

    /**
     * Converts an ArrayBuffer to a Base64 string
     */
    private arrayBufferToBase64(buffer: ArrayBuffer): string {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }

    /**
     * Encrypts the API Key using the Public Key (RSA)
     * We use RSA-OAEP which is standard for Web Crypto.
     */
    public async getBearerToken(): Promise<string> {
        try {
            const publicKeyBuffer = this.base64ToArrayBuffer(MPESA_CONFIG.PUBLIC_KEY);

            // Import the public key
            const importedKey = await window.crypto.subtle.importKey(
                "spki",
                publicKeyBuffer,
                {
                    name: "RSA-OAEP",
                    hash: "SHA-256"
                },
                false,
                ["encrypt"]
            );

            // Encode API Key to buffer
            const encoder = new TextEncoder();
            const apiKeyBuffer = encoder.encode(MPESA_CONFIG.API_KEY);

            // Encrypt
            const encryptedBuffer = await window.crypto.subtle.encrypt(
                {
                    name: "RSA-OAEP"
                },
                importedKey,
                apiKeyBuffer
            );

            const encryptedBase64 = this.arrayBufferToBase64(encryptedBuffer);
            return `${encryptedBase64}`; // Usually formatted as just the string, or 'Bearer <string>' in header

        } catch (error) {
            console.error("M-Pesa Encryption Error:", error);
            return `SIMULATED_ENCRYPTED_TOKEN_${Date.now()}`; 
        }
    }

    /**
     * Initiates a C2B Payment
     */
    public async initiatePayment(phoneNumber: string, amount: number, reference: string): Promise<boolean> {
        try {
            const bearerToken = await this.getBearerToken();
            
            console.log("--- M-Pesa Transaction Started ---");
            console.log("Encrypted Bearer:", bearerToken);
            console.log("Payload:", { 
                input_CustomerMSISDN: phoneNumber,
                input_Amount: amount.toFixed(2),
                input_TransactionReference: reference,
                input_ServiceProviderCode: "171717" // Example code
            });

            // SIMULATION
            // In a real app, we would fetch(MPESA_CONFIG.RESOURCE_URL, ...) here.
            return new Promise((resolve) => {
                setTimeout(() => {
                    // Assume success for valid phone numbers (84/85)
                    const cleanPhone = phoneNumber.replace(/\D/g, '');
                    if (cleanPhone.startsWith('84') || cleanPhone.startsWith('85')) {
                        console.log("--- M-Pesa Transaction Successful ---");
                        resolve(true);
                    } else {
                        console.warn("--- M-Pesa Transaction Failed (Invalid Prefix) ---");
                        resolve(false);
                    }
                }, 4000); // 4 second delay to simulate PIN entry and network
            });

        } catch (error) {
            console.error("Payment Initialization Failed:", error);
            return false;
        }
    }
}

export const mpesaService = new MpesaService();
