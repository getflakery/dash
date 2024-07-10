import jwt from 'jsonwebtoken';

export default defineEventHandler(async (event) => {
    // if path start with /api/v0, check for authentication header
    if (event.path.startsWith('/api/v0')) {
        event.context.auth =  await jwt.verify(event.req.headers.authentication, 'mysecrettoken');
    }
});