import { CapacitorSQLite } from '@capacitor-community/sqlite';

const DATABASE_NAME="keyra-db-v1";
const CREATE_TABLE_QUERY=`
CREATE TABLE IF NOT EXISTS drive_points (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    latitude REAL,
    longitude REAL,
    speed REAL,
    timestamp INTEGER,
    isLastPoint INTEGER,
    driveId TEXT
);
`

export async function initializeDatabase() {
    try {
        console.log('Initializing database...');

        const sqlite = CapacitorSQLite;

        await sqlite.createConnection({
            database: DATABASE_NAME,
            version: 1,
            encrypted: false,
            mode: 'no-encryption'
        });

        await sqlite.open({ database: DATABASE_NAME });

        await queryDatabase(CREATE_TABLE_QUERY, []);

        console.log('Database initialized.');
    } catch (e) {
        console.error(e);
    }
}

export async function queryDatabase(statement: string, values: any[]): Promise<any[]> {
    console.log('Querying database:', statement, values);

    try {
        const queryOptions = {
            database: DATABASE_NAME,
            statement,
            values
        }
    
        const result = await CapacitorSQLite.query(queryOptions);
        const filteredResult = result.values?.filter((val: any) => val.ios_columns == null) || [];
        console.log('Query successful. Result:', filteredResult);

        return filteredResult || [];
    } catch (e) {
        console.error('Query failed:', e);
        return [];
    }
}
