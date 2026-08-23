const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../.env') });

const mongoose = require('mongoose');
const fs = require('fs');

async function runForensicDatabaseInventory() {
  console.log('================================================================');
  console.log(' VENTRIVA DATABASE & SCHEMAS FORENSIC INVENTORY AUDIT ');
  console.log('================================================================\n');

  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  console.log('Connected Database Name:', db.databaseName);
  const dbCols = await db.listCollections().toArray();
  console.log('MongoDB Atlas Collection Count:', dbCols.length);

  // Load all 50 Mongoose models
  const modelsDir = path.join(__dirname, '../models');
  const modelFiles = fs.readdirSync(modelsDir).filter((f) => f.endsWith('.js'));
  modelFiles.forEach((file) => require(path.join(modelsDir, file)));

  const registeredModels = Object.keys(mongoose.models);
  console.log('Registered Mongoose Models Count:', registeredModels.length);

  // Document Counts per collection
  let totalDocs = 0;
  let userCount = 0;
  let businessDocCount = 0;
  const colBreakdown = [];

  for (const col of dbCols) {
    const count = await db.collection(col.name).countDocuments();
    colBreakdown.push({ name: col.name, count });
    totalDocs += count;
    if (col.name === 'users') {
      userCount = count;
    } else {
      businessDocCount += count;
    }
  }

  console.log('\n--- COLLECTION DOCUMENT BREAKDOWN ---');
  colBreakdown.sort((a, b) => b.count - a.count);
  for (const col of colBreakdown) {
    if (col.count > 0) {
      console.log(`- Collection '${col.name}': ${col.count} document(s)`);
    }
  }

  console.log('\n--- BASELINE METRICS ---');
  console.log('Total Collections:', dbCols.length);
  console.log('Total Documents:', totalDocs);
  console.log('User Accounts Count:', userCount);
  console.log('Business Documents Count:', businessDocCount);

  // Foreign Key References Audit
  let totalRefs = 0;
  let missingRefTargets = [];

  for (const modelName of registeredModels) {
    const model = mongoose.model(modelName);
    const schema = model.schema;
    const paths = schema.paths;

    for (const [pName, pObj] of Object.entries(paths)) {
      let targetRef = null;
      if (pObj.options && pObj.options.ref) {
        targetRef = pObj.options.ref;
      } else if (pObj.caster && pObj.caster.options && pObj.caster.options.ref) {
        targetRef = pObj.caster.options.ref;
      }

      if (targetRef) {
        totalRefs++;
        if (!registeredModels.includes(targetRef)) {
          missingRefTargets.push({ from: modelName, field: pName, ref: targetRef });
        }
      }
    }
  }

  console.log('\n--- FOREIGN KEY SCHEMA INTEGRITY ---');
  console.log('Total Schema Foreign Key References:', totalRefs);
  console.log('Invalid Foreign Key Target References:', missingRefTargets.length);
  if (missingRefTargets.length > 0) {
    console.error('❌ Missing Ref Targets:', missingRefTargets);
  } else {
    console.log('✓ PASS: All foreign key reference targets point to valid Mongoose models 100%!');
  }

  await mongoose.connection.close();
}

runForensicDatabaseInventory().catch((err) => {
  console.error('Forensic Database Inventory Error:', err);
  process.exit(1);
});
