const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, 'src/app/widgets/components');
const outputFile = path.join(__dirname, 'src/app/widgets/frontEndWidgets.tsx');

if (!fs.existsSync(componentsDir)) {
    console.error(`[Widget Generator] Error: Directory not found at ${componentsDir}`);
    process.exit(1);
}

const files = fs.readdirSync(componentsDir).filter(file => file.endsWith('.tsx'));

let imports = `// AUTO-GENERATED FILE. DO NOT EDIT DIRECTLY.\n`;
imports += `import React from 'react';\n`;
imports += `import { WidgetManifest } from './sdk';\n\n`;

// the whole module, so a widget can export its manifest (config) next to the component
let modules = `const modules: Record<string, { default: React.ElementType, config?: WidgetManifest }> = {\n`;

files.forEach(file => {
  const name = file.replace('.tsx', '');
  const componentName = name.split(/[-_]/).map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('');
    
  imports += `import * as ${componentName} from './components/${name}';\n`;
  modules += `  '${name}': ${componentName},\n`;
});

modules += `};\n\n`;
modules += `const FrontEndWidgets: Record<string, React.ElementType> = Object.fromEntries(Object.entries(modules).map(([name, m]) => [name, m.default]));\n\n`;
modules += `export const widgetConfigs: Record<string, WidgetManifest | undefined> = Object.fromEntries(Object.entries(modules).map(([name, m]) => [name, m.config]));\n\n`;
modules += `export default FrontEndWidgets;\n`;

fs.writeFileSync(outputFile, imports + '\n' + modules, 'utf8');
console.log(`[Widget Generator] Successfully generated frontEndWidgets.tsx with ${files.length} widgets.`);
