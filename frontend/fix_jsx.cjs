const fs = require('fs');
const path = require('path');
const pagesDir = 'd:/ExVeg/frontend/src/pages';
const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.jsx'));

files.forEach(f => {
  let code = fs.readFileSync(path.join(pagesDir, f), 'utf-8');
  
  // Fix lowercase events
  code = code.replace(/onclick="[^"]*"/g, 'onClick={() => {}}');
  code = code.replace(/onchange="[^"]*"/g, 'onChange={() => {}}');
  code = code.replace(/oninput="[^"]*"/g, 'onInput={() => {}}');
  code = code.replace(/onsubmit="[^"]*"/g, 'onSubmit={(e) => e.preventDefault()}');
  
  // Fix boolean attributes
  code = code.replace(/checked=""/g, 'defaultChecked');
  code = code.replace(/selected=""/g, 'defaultSelected');
  code = code.replace(/disabled=""/g, 'disabled');
  code = code.replace(/required=""/g, 'required');
  code = code.replace(/readonly=""/g, 'readOnly');
  
  // Fix other react attributes
  code = code.replace(/tabindex=/g, 'tabIndex=');
  code = code.replace(/maxlength=/g, 'maxLength=');
  code = code.replace(/stroke-width/g, 'strokeWidth');
  code = code.replace(/stroke-dasharray/g, 'strokeDasharray');
  code = code.replace(/stroke-dashoffset/g, 'strokeDashoffset');
  code = code.replace(/fill-rule/g, 'fillRule');
  code = code.replace(/clip-rule/g, 'clipRule');
  code = code.replace(/stroke-linecap/g, 'strokeLinecap');
  code = code.replace(/stroke-linejoin/g, 'strokeLinejoin');

  fs.writeFileSync(path.join(pagesDir, f), code);
});
console.log('Fixed JSX attributes in all files');
