import dynamic from 'next/dynamic';
import { JSXElementConstructor } from 'react';

const context = (require as any).context('./components', false, /\.tsx$/);
const AvailableWidgets: Record<string, React.ReactElement<unknown, string | JSXElementConstructor<any>>> = {};
context.keys().forEach((key: string) => {
  const fileName = key.replace(/^\.\/|\.tsx$/g, '');
  const module = context(key);
  AvailableWidgets[fileName] = module.default || module;
});

export default AvailableWidgets;
