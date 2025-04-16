import slugify from "slugify";

export const slugifyUtil = (text: string): string => {
  return slugify(text, {
    replacement: "-",
    remove: /[$*_+~.,()'ʻ"!?\-:@]/g,
    lower: true,
  });
};
