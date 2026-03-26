const {createClient} = require("redis");

const redisclient = createClient({
  username: "default",
  password: process.env.REDIS_PASS,
  socket: {
    host: "redis-16441.crce206.ap-south-1-1.ec2.cloud.redislabs.com",
    port: 16441,
  },
});

module.exports = redisclient;
