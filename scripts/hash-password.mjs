import bcrypt from "bcryptjs";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const passwordFromArg = process.argv[2];

async function readPassword() {
  if (passwordFromArg) {
    return passwordFromArg;
  }

  const rl = createInterface({ input, output });
  const password = await rl.question("Mot de passe admin a hasher : ");
  rl.close();
  return password;
}

const password = await readPassword();

if (!password) {
  console.error("Mot de passe vide.");
  process.exit(1);
}

const hash = await bcrypt.hash(password, 12);
console.log(hash);
