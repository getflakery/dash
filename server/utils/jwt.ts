import jwt from 'jsonwebtoken';


export class JWT {
    secret: string;

    constructor(secret: string) {
        this.secret = secret;
    }

    sign(payload: object) {
        return jwt.sign(payload, this.secret);
    }

    verify(token: string) {
        return jwt.verify(token, this.secret);
    }

}

let _jwt: JWT | null = null;
export const useJWT = () => {
    const config = useRuntimeConfig();

    if (!_jwt) {
        _jwt = new JWT(config.jwt_secret);
    }

    return _jwt;
};