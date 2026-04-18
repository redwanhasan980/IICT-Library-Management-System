import React from 'react';
import { SpineLabel } from '../../types/spineLabel.types';

interface SpineLabelPreviewProps {
  label: SpineLabel;
}

const SpineLabelPreview: React.FC<SpineLabelPreviewProps> = ({ label }) => {
  return (
    <div className="w-[2in] h-[1in] border border-dashed border-gray-400 p-2 flex flex-col justify-center items-center bg-white text-black font-mono text-sm">
      <div className="text-center">
        <p>{label.classificationNumber}</p>
        <p>{label.authorCode}</p>
        <p className="mt-2">{label.accessionNumber}</p>
      </div>
    </div>
  );
};

export default SpineLabelPreview;
