import generateUniqueId from "generate-unique-id";

export const generateUniqueIdUtil = (length = 7): string => {
  return generateUniqueId({
    length,
    useLetters: false,
  });
};
