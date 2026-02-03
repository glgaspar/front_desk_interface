import dynamicImportAll from '@/Utils/dynamicImportAll';

const AvailableWidgets = dynamicImportAll('./components');

export default AvailableWidgets
//  const AvailableWidgets: { [key: string]: React.ReactNode } = exportedWidgets;

