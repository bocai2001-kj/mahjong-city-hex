"use strict";

const tencentcloud = require("tencentcloud-sdk-nodejs-tcb");

function createSqlClient({ envId, region = "ap-shanghai" }) {
  const Client = tencentcloud.tcb.v20180608.Client;
  const client = new Client({
    credential: {
      secretId: process.env.TENCENTCLOUD_SECRETID,
      secretKey: process.env.TENCENTCLOUD_SECRETKEY,
      token: process.env.TENCENTCLOUD_SESSIONTOKEN,
    },
    region,
    profile: {
      httpProfile: { endpoint: "tcb.tencentcloudapi.com" },
    },
  });

  return (sql) => client.ExecutePGSql({ EnvId: envId, Sql: sql });
}

module.exports = { createSqlClient };
