const { Client } = require('pg');
const bcrypt = require('bcrypt');

const dbUrl = 'postgresql://neondb_owner:npg_k02imdhjgMwb@ep-old-hall-adxplbaq-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const client = new Client({ connectionString: dbUrl });

client.connect().then(async () => {
    try {
        const hash = await bcrypt.hash('Admin1212$', 10);
        await client.query('UPDATE "customers" SET password = $1 WHERE email = $2', [hash, 'admin']);
        const res = await client.query('SELECT * FROM "customers" WHERE email = $1', ['admin']);
        
        if (res.rows.length === 0) {
            await client.query('INSERT INTO "customers" (id, name, email, password, company, "createdAt") VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW())', ['Admin Test', 'admin', hash, 'Vortex']);
            console.log('Created customer admin');
        } else {
            console.log('Updated customer admin password');
        }
    } catch (e) {
        console.error(e);
    } finally {
        client.end();
    }
});
