import { RapAction, RapActionParameters, RapActionTypes } from './references';

export const createNewAction = (
  type: RapActionTypes,
  parameters: RapActionParameters,
): RapAction => {
  const newAction = {
    parameters,
    transaction: { confirmed: null, hash: null },
    type,
  };
  return newAction;
};

export const createNewRap = (actions: RapAction[]) => {
  return {
    actions,
  };
};
