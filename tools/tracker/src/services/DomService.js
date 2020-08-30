let globalId = 0;

/**
 * Creates an app-unique element ID.
 */
export const createElementId = () => {
  return `elm-${globalId++}`;
};
