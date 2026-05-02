import React from 'react';
import type { SpineLabel } from '../../types/spineLabel.types';

interface SpineLabelPreviewProps {
  label: SpineLabel;
}

const SpineLabelPreview: React.FC<SpineLabelPreviewProps> = ({ label }) => {
  return (
    <div className="flex h-[1in] w-[2in] flex-col items-center justify-center border-2 border-dashed border-library-ink bg-paper-soft p-2 font-mono text-sm text-library-ink">
      <div className="text-center">
        <p>{label.classificationNumber}</p>
        <p>{label.authorCode}</p>
        <p className="mt-2">{label.accessionNumber}</p>
      </div>
    </div>
  );
};

export default SpineLabelPreview;
