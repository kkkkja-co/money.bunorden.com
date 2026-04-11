const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    try {
      filelist = fs.statSync(dirFile).isDirectory() ? walkSync(dirFile, filelist) : filelist.concat(dirFile);
    } catch (err) {}
  });
  return filelist;
};

const replaceInFile = (filePath) => {
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;
  const content = fs.readFileSync(filePath, 'utf8');
  let newContent = content;
  
  // Replace the spinner classes
  newContent = newContent.replace(
    /<div className="w-5 h-5 rounded-full border-2 border-[A-Za-z0-9/-]+ border-t-transparent animate-spin" \/>/g, 
    '<span className="animate-pulse font-bold tracking-[0.2em] text-[10px] uppercase opacity-60">Working...</span>'
  );
  newContent = newContent.replace(
    /<div className="w-8 h-8 rounded-full border-2 border-[A-Za-z0-9/-]+ border-t-transparent animate-spin" \/>/g, 
    '<div className="animate-pulse font-black text-sm tracking-[0.3em] uppercase opacity-40">Loading...</div>'
  );
  
  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent);
    console.log('Updated', filePath);
  }
};

const dirs = ['app', 'components'];
dirs.forEach(dir => {
  const files = walkSync(path.join(process.cwd(), dir));
  files.forEach(replaceInFile);
});
console.log('Done');
