/**
 * ts-node createuser.ts <email> <name> <password> <isAdmin [0:1]>
 * ts-node createuser.ts user@email.com 'User Full Name' mysuppersecretpassword 1
 *
 * WARNING: there is no validation here, be careful
 */

import { Client } from 'pg';
import { AuthService } from '../auth/auth.service';

(async () => {
  const client = new Client({
    connectionString: process.env['DB_URL'],
  });
  await client.connect();
  const email = process.argv[2];
  const name = process.argv[3];
  const hashedPswd = await AuthService.generateSaltedHashedPassword(
    process.argv[4],
  );
  const isAdmin = process.argv[5] === '1';

  client.query(
    'INSERT INTO "user"("email", "name", "password", "isAdmin") VALUES($1, $2, $3, $4)',
    [email, name, hashedPswd, isAdmin],
    (err, res) => {
      console.log(err ? err.stack : res);
      client.end();
    },
  );
})();
