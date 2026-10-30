import fs from 'fs';
import path from 'path';

const outputJsonPath = 'C:/Users/HP/.gemini/antigravity/brain/e243202f-43ac-457f-869c-25400e6e3ba6/.system_generated/steps/283/output.txt';
const pagesDir = 'd:/ExVeg/frontend/src/pages';
const htmlDir = path.join(pagesDir, 'html');

if (!fs.existsSync(htmlDir)) {
  fs.mkdirSync(htmlDir, { recursive: true });
}

function toCamelCase(str) {
  return str.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); });
}

function htmlToJsx(html) {
  // Very basic HTML to JSX conversion
  let jsx = html
    .replace(/class=/g, 'className=')
    .replace(/for=/g, 'htmlFor=')
    .replace(/<!--/g, '{/*')
    .replace(/-->/g, '*/}')
    // fix self closing tags
    .replace(/<input([^>]*?[^\/])>/g, '<input$1 />')
    .replace(/<img([^>]*?[^\/])>/g, '<img$1 />')
    .replace(/<br>/g, '<br />')
    .replace(/<hr>/g, '<hr />')
    // fix inline styles
    .replace(/style="([^"]*)"/g, (match, styleString) => {
      const styleObj = {};
      styleString.split(';').forEach(style => {
        if (!style.trim()) return;
        const [key, value] = style.split(':');
        if (key && value) {
          const camelKey = toCamelCase(key.trim());
          styleObj[camelKey] = value.trim();
        }
      });
      return `style={${JSON.stringify(styleObj)}}`;
    });

  // Extract body content
  const bodyMatch = jsx.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch) {
    jsx = bodyMatch[1];
  } else {
    // If no body tag, assume it's just a snippet
  }

  // Remove trailing scripts
  jsx = jsx.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  return jsx;
}

async function main() {
  const jsonContent = fs.readFileSync(outputJsonPath, 'utf8');
  // the first line might have some text, let's parse the JSON part
  let data;
  try {
    const jsonStr = jsonContent.match(/\{[\s\S]*\}/)[0];
    data = JSON.parse(jsonStr);
  } catch (e) {
    console.error("Failed to parse JSON", e);
    return;
  }

  const screens = data.screens || [];
  console.log(`Found ${screens.length} screens.`);

  for (const screen of screens) {
    const nameStr = screen.title.replace(/[^a-zA-Z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
    const componentName = nameStr.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
    
    if (['Home', 'Products', 'ProductDetails'].includes(componentName) || componentName.includes('ProductDetailsAgriMarketConnect') || componentName.includes('MarketplaceProductListing') || componentName.includes('HomepageAgriMarketConnect')) {
      console.log(`Skipping ${componentName} as it already exists.`);
      continue;
    }

    console.log(`Processing ${componentName}...`);
    const downloadUrl = screen.htmlCode.downloadUrl;
    
    try {
      const response = await fetch(downloadUrl);
      const htmlText = await response.text();
      
      const htmlFilePath = path.join(htmlDir, `${componentName}.html`);
      fs.writeFileSync(htmlFilePath, htmlText);

      const jsxContent = htmlToJsx(htmlText);
      
      const componentCode = `import React from 'react';\nimport { Link } from 'react-router-dom';\n\nconst ${componentName} = () => {\n  return (\n    <>\n      ${jsxContent}\n    </>\n  );\n};\n\nexport default ${componentName};\n`;
      
      const jsxFilePath = path.join(pagesDir, `${componentName}.jsx`);
      fs.writeFileSync(jsxFilePath, componentCode);
      console.log(`Saved ${componentName}.jsx`);
      
    } catch (err) {
      console.error(`Error processing ${componentName}:`, err);
    }
  }
}

main();
