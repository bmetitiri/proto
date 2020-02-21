#!/usr/bin/env node
const axios = require("axios");
const sqlite = require("sqlite");
const SQL = require("sql-template-strings");

// NOTE: The url/headers/query should be copied from the
// https://console.cloud.google.com/datastore/entities
// request.

const url = "https://datastore...google.com/v1/projects/...project...";

const headers = {
  Origin: "https://console.cloud.google.com"
};

const query = startCursor => ({
  query: {
    kind: [{ name: "token" }],
    limit: 200,
    order: [{ property: { name: "Created" }, direction: "ASCENDING" }],
    ...(startCursor ? { startCursor } : {})
  },
  partitionId: { namespaceId: "" }
});

const sleep = t => new Promise(resolve => setTimeout(resolve, t));

const request = async (db, startCursor) => {
  const {
    data: {
      batch: { entityResults, endCursor, moreResults }
    }
  } = await axios.post(url, query(startCursor), { headers });

  for (const {
    entity: { properties }
  } of entityResults) {
    await db.run(
      SQL`insert into token values (
        ${properties.TeamId.stringValue},
        ${properties.TeamName.stringValue},
        ${properties.Created.timestampValue},
        ${properties.TokenType.stringValue},
        ${properties.AccessToken.stringValue},
        ${properties.RefreshToken.stringValue},
        ${properties.Scope.stringValue},
        ${properties.Expiry.timestampValue}
      )`
    );
  }

  if (moreResults === "MORE_RESULTS_AFTER_LIMIT") {
    console.log(await db.get(SQL`select count() from token`), endCursor);
    await sleep(1000);
    return await request(db, endCursor);
  } else {
    console.log(moreResults);
  }
};

const main = async () => {
  try {
    const db = await (await sqlite.open("./db.sqlite")).migrate();
    request(db, process.argv[2]);
  } catch (e) {
    console.error(e);
  }
};

main();
