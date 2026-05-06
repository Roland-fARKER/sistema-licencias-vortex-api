import * as crypto from 'crypto';

export class CryptoUtils {
    static generateKeyPair() {
        return crypto.generateKeyPairSync('rsa', {
            modulusLength: 2048,
            publicKeyEncoding: {
                type: 'spki',
                format: 'pem',
            },
            privateKeyEncoding: {
                type: 'pkcs8',
                format: 'pem',
            },
        });
    }

    static sign(payload: any, privateKey: string): string {
        const data = JSON.stringify(payload);
        const signature = crypto.sign('sha256', Buffer.from(data), {
            key: privateKey,
            padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
        });

        const payloadBase64 = Buffer.from(data).toString('base64');
        const signatureBase64 = signature.toString('base64');

        return `${payloadBase64}.${signatureBase64}`;
    }

    static verify(serial: string, publicKey: string): boolean {
        try {
            const [payloadBase64, signatureBase64] = serial.split('.');
            const data = Buffer.from(payloadBase64, 'base64').toString();
            const signature = Buffer.from(signatureBase64, 'base64');

            return crypto.verify(
                'sha256',
                Buffer.from(data),
                {
                    key: publicKey,
                    padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
                },
                signature
            );
        } catch (e) {
            return false;
        }
    }
}
