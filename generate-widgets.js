const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, 'src/app/widgets/components');
const outputFile = path.join(__dirname, 'src/app/widgets/availableWidgets.tsx');

if (!fs.existsSync(componentsDir)) {
    console.error(`[Widget Generator] Error: Directory not found at ${componentsDir}`);
    process.exit(1);
}

const files = fs.readdirSync(componentsDir).filter(file => file.endsWith('.tsx'));

let imports = `// AUTO-GENERATED FILE. DO NOT EDIT DIRECTLY.\n`;
imports += `import React from 'react';\n\n`;

let availableWidgets = `const AvailableWidgets: Record<string, React.ElementType> = {\n`;

files.forEach(file => {
  const name = file.replace('.tsx', '');
  const componentName = name.split(/[-_]/).map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('');
    
  imports += `import ${componentName} from './components/${name}';\n`;
  availableWidgets += `  '${name}': ${componentName},\n`;
});

availableWidgets += `};\n\nexport default AvailableWidgets;\n`;

fs.writeFileSync(outputFile, imports + availableWidgets, 'utf8');
console.log(`[Widget Generator] Successfully generated availableWidgets.tsx with ${files.length} widgets.`);