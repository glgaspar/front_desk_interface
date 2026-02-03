import dynamic from 'next/dynamic';

const dynamicImportAll = (path:string) => {
  const modules: Record<string, any> = {};
  const context = (require as any).context(path, true, /\.tsx$/);

  context.keys().forEach((key:string) => {
    const fileName = key.replace(/^\.\/(.*)\.\w+$/, '$1');
    const module = context(key);
    const defaultExport = module.default || module;
    modules[fileName] = dynamic(() => Promise.resolve(defaultExport));
  });

  return modules;
};

export default dynamicImportAll;