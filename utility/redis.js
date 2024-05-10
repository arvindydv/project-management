const redis = require("redis");
require("dotenv").config();

const getClient = () => {
  return redis.createClient({
	url: process.env.REDIS_URL
	});
};

let client = getClient();
const connect = () => {
  client.connect();
};

const get = async (key) => {
  const data = await client.get(key);
  console.log(data);
  return data;
};

const set = async (key, value, time = 1) => {
  if (!client) client = getClient();
  return await client.set(key, value, { EX: time * process.env.REDIS_EXT });
};

const del = async (key) => {
  return await client.del(key);
};

module.exports = {
  connect,
  get,
  set,
  del,
};
