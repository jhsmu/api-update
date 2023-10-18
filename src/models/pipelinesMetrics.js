const mongoose = require ('mongoose');

async function connectToDatabase() {
  try {
    console.log("Intentando conectar a MongoDB...");

    const url = "mongodb+srv://jhsmu0104:pIjaRyAxw8jNcmNx@cluster0.absbnml.mongodb.net/prueba";

    await mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
     // Conecta a la base de datos "jenkins_pipelines"
    console.log("Conexión exitosa a la base de datos");
  } catch (error) {
    console.error("Error de conexión:", error);
  }
}

const pruebas_metricasSchema = new mongoose.Schema({
  pipelineName: {type: String, required: true},
  appName: {type: String, required: true},
  buildNumber: {type: Number, required: true},
  buildUser: {type: String, required: true},
  executionResult: {type: String, enum: ['RUNNING', 'SUCCESS', 'FAILURE', 'ABORTED','UNSTABLE']},
  action: {type: String, required: true},
  type: {type: String, enum: ['BROKER', 'MICROSERVICE', 'KOMETSALES']},
  environment: {type: String, enum: ['PRODUCTION', 'TEST', 'UAT']},
  originBranch: String,
  deployedBranch: String,
  targetBranch: String,
  executionStart: {type: String, required: true},
  executionEnd: {type: String, required: true},
  duration:{type: String, required: true},
  durationSeg:{type: String, required: true},

});

const pipelinesMetrics = mongoose.model('pruebas_metricas', pruebas_metricasSchema, 'pruebas_metricas');

module.exports = {pipelinesMetrics , connectToDatabase };