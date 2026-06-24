import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { promises as fs } from "fs";
import path from "path";
import {
  readAccounts,
  upsertAccount,
  removeAccount,
  getAccount,
  listConnections,
} from "./accountStore";

const PREFIX = "testacct";
const USER = "store-user";
const file = path.join(process.cwd(), ".citadel-secrets", `${PREFIX}-${USER}.json`);

async function reset() {
  await fs.unlink(file).catch(() => {});
}
beforeEach(reset);
afterEach(reset);

describe("accountStore — multi-account token store", () => {
  it("starts empty", async () => {
    expect(await readAccounts(PREFIX, USER)).toEqual([]);
  });

  it("upserts, then replaces by accountId (not duplicates)", async () => {
    await upsertAccount(PREFIX, USER, { accountId: "a@x.com", email: "a@x.com", refreshToken: "r1" });
    await upsertAccount(PREFIX, USER, { accountId: "b@x.com", email: "b@x.com", refreshToken: "r2" });
    expect(await readAccounts(PREFIX, USER)).toHaveLength(2);

    // Same accountId again → replace, not add.
    await upsertAccount(PREFIX, USER, { accountId: "a@x.com", email: "a@x.com", refreshToken: "r1-new" });
    const accts = await readAccounts(PREFIX, USER);
    expect(accts).toHaveLength(2);
    expect((await getAccount(PREFIX, USER, "a@x.com"))?.refreshToken).toBe("r1-new");
  });

  it("removes one account, then all", async () => {
    await upsertAccount(PREFIX, USER, { accountId: "a@x.com", refreshToken: "r1" });
    await upsertAccount(PREFIX, USER, { accountId: "b@x.com", refreshToken: "r2" });
    expect(await removeAccount(PREFIX, USER, "a@x.com")).toBe(1); // one remains
    expect((await listConnections(PREFIX, USER)).map((c) => c.accountId)).toEqual(["b@x.com"]);
    expect(await removeAccount(PREFIX, USER)).toBe(0); // remove all
    expect(await readAccounts(PREFIX, USER)).toEqual([]);
  });

  it("migrates a legacy single-token file into a one-account list", async () => {
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(
      file,
      JSON.stringify({ refreshToken: "legacy", accessToken: "at", expiresAt: 123, email: "Legacy@X.com" }),
      "utf8"
    );
    const accts = await readAccounts(PREFIX, USER);
    expect(accts).toHaveLength(1);
    expect(accts[0].refreshToken).toBe("legacy");
    expect(accts[0].accountId).toBe("legacy@x.com"); // lowercased email
  });
});
