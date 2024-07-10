import jwt from 'jsonwebtoken';

export default defineEventHandler(async (event) => {
    // if path start with /api/v0, check for authentication header
    if (event.path.startsWith('/api/v0')) {
        let tokenHeader = event.headers.get('Authorization');
        let token = tokenHeader?.split(' ')[1];
        let config = useRuntimeConfig();
        event.context.auth =  await jwt.verify(token, config.jwt_secret);
    }
});