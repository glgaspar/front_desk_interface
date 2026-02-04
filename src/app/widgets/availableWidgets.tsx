import dynamic from 'next/dynamic';

const context = (require as any).context('./components', false, /\.tsx$/);
const AvailableWidgets: Record<string, any> = {};

context.keys().forEach((key: string) => {
  const fileName = key.replace(/^\.\/|\.tsx$/g, '');
  AvailableWidgets[fileName] = dynamic(() => Promise.resolve(context(key)));
});

export default AvailableWidgets;
