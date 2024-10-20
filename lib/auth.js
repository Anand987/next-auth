import { BetterSqlite3Adapter } from '@lucia-auth/adapter-sqlite';
import { Lucia } from 'lucia'
import db from './db';

// Initialization of lucia, with adapter to store sessions automatcally to db by lucia adapter.
const adapter = new BetterSqlite3Adapter(db, {
    user: 'users',
    session: 'sessions'
})

const lucia = new Lucia(adapter, {
    sessionCookie: {
        expires: false,
        attributes: {
            secure: process.env.NODE_ENV === 'production' // automatically set to true while running in the production envirornment
        }
    }
});