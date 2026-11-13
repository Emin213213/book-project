declare global {
    namespace Express {
        interface Request {
            auth?: AuthContext;
        }
    }
}