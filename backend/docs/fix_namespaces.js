const fs = require('fs');
const path = require('path');

// Map of module names to their correct namespace (from controllers)
const namespaceMap = {
  'qc-sample': 'QCSample',
  'qc-test': 'QCTest',
  'qc-result': 'QCResult',
  'qa-release': 'QARelease',
  'purchase-order': 'PurchaseOrder',
  'goods-receipt': 'GoodsReceipt',
  'raw-material': 'RawMaterial',
  'supplier': 'Supplier',
  'drug': 'Drug'
};

Object.entries(namespaceMap).forEach(([moduleName, correctNamespace]) => {
  const exceptionFile = path.join(__dirname, 'src/modules', moduleName, 'exception.tsp');
  
  if (fs.existsSync(exceptionFile)) {
    let content = fs.readFileSync(exceptionFile, 'utf8');
    
    // Fix namespace declaration
    const oldNamespacePattern = /namespace api\.\w+;/;
    content = content.replace(oldNamespacePattern, `namespace api.${correctNamespace};`);
    
    fs.writeFileSync(exceptionFile, content);
    console.log(`Fixed namespace in ${exceptionFile} to api.${correctNamespace}`);
  }
});
