import { GenerateSpineLabelInput } from '../validators/spineLabel.validator';

export const prepareLabelData = (data: GenerateSpineLabelInput['body']) => {
  const { accessionNumber, authorCode, classificationNumber } = data;

  // This service can be expanded later to include more complex logic
  // for formatting or selecting templates. For now, it just returns
  // the structured data.

  return {
    classificationNumber,
    authorCode,
    accessionNumber,
  };
};
