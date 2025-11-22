
// services/mpesaService.ts

// Configuration - In a real app, these should be environment variables
const MPESA_CONFIG = {
    // Keys provided in documentation
    PUBLIC_KEY: "MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAszE+xAKVB9HRarr6/uHYYAX/RdD6KGVIGlHv98QKDIH26ldYJQ7zOuo9qEscO0M1psSPe/67AWYLEXh13fbtcSKGP6WFjT9OY6uV5ykw9508x1sW8UQ4ZhTRNrlNsKizE/glkBfcF2lwDXJGQennwgickWz7VN+AP/1c4DnMDfcl8iVIDlsbudFoXQh5aLCYl+XOMt/vls5a479PLMkPcZPOgMTCYTCE6ReX3KD2aGQ62uiu2T4mK+7Z6yvKvhPRF2fTKI+zOFWly//IYlyB+sde42cIU/588msUmgr3G9FYyN2vKPVy/MhIZpiFyVc3vuAAJ/mzue5p/G329wzgcz0ztyluMNAGUL9A4ZiFcKOebT6y6IgIMBeEkTwyhsxRHMFXlQRgTAufaO5hiR/usBMkoazJ6XrGJB8UadjH2m2+kdJIieI4FbjzCiDWKmuM58rllNWdBZK0XVHNsxmBy7yhYw3aAIhFS0fNEuSmKTfFpJFMBzIQYbdTgI28rZPAxVEDdRaypUqBMCq4OstCxgGvR3Dy1eJDjlkuiWK9Y9RGKF8HOI5a4ruHyLheddZxsUihziPF9jKTknsTZtF99eKTIjhV7qfTzxXq+8GGoCEABIyu26LZuL8X12bFqtwLAcjfjoB7HlRHtPszv6PJ0482ofWmeH0BE8om7VrSGxsCAwEAAQ==",
    API_KEY: "aaaab09uz9f3asdcjyk7els777ihmwv8",
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
