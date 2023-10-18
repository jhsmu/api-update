const {pipelinesMetrics} = require ("../models/pipelinesMetrics");

async function getMongoData() {
  return pipelinesMetrics.find();
}
 
async function getUpdateData(date) {
  return pipelinesMetrics.find({ executionStart: { $gt: date } });
}


async function saveNewData(newData) {
  return pipelinesMetrics.saveNewData(newData);
}



module.exports = {
  getMongoData,
  saveNewData,
  getUpdateData
};