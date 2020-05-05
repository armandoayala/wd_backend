const NodeCache = require( "node-cache" );
const appCache = new NodeCache({ stdTTL: 3600, checkperiod: 0, useClones: true, deleteOnExpire: true });

function put(key,value)
{
  return appCache.set(key,value);
}

function get(key)
{
  return appCache.get(key);
}

function del(key)
{
  return appCache.del(key);
}

function flush()
{
  appCache.flushAll();
}

module.exports=
{
  put,
  get,
  del,
  flush
}
