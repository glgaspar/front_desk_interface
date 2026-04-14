import React from 'react';

const req = require as NodeJS.Require & {
  context: (path: string, deep?: boolean, filter?: RegExp) => {
    keys: () => string[];
    (id: string): { default?: React.ElementType } & React.ElementType;
  };
};
const context = req.context('./components', false, /\.tsx$/);
const AvailableWidgets: Record<string, React.ElementType> = {};
context.keys().forEach((key: string) => {
  const fileName = key.replace(/^\.\/|\.tsx$/g, '');
  const widgetModule = context(key);
  AvailableWidgets[fileName] = widgetModule.default || widgetModule;
});

export default AvailableWidgets;
