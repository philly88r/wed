import pgPromise from 'pg-promise';
import { IDatabase, IMain } from 'pg-promise';
import { IClient } from 'pg';

const pgp: IMain = pgPromise({
    // Initialization Options
    capSQL: true, // capitalize all generated SQL
    connect(e: { client: IClient; dc: any; useCount: number }) {
        console.log('Connected to database:', e.client.connectionParameters.database);
    },
    error(err: Error) {
        console.error('Database Error:', err);
    }
});

const config = {
    connectionString: 'postgresql://postgres:Yitbos88@db.yemkduykvfdjmldxfphq.supabase.co:5432/postgres',
    ssl: { rejectUnauthorized: false },
    max: 30 // use up to 30 connections
};

const db: IDatabase<any> = pgp(config);

// Helper for linking to external query files:
import { join } from 'path';
export const sql = (file: string) => {
    const fullPath = join(__dirname, file);
    return new pgp.QueryFile(fullPath, {minify: true});
};

export default db;
