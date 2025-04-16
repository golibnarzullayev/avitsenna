import dayjs from "dayjs";
import * as Handlebars from "handlebars";

export const hbsHelpers = (handlebars: typeof Handlebars) => {
  handlebars.registerHelper("paginate", require("handlebars-paginate"));

  handlebars.registerHelper("ifEquals", function (arg1, arg2, options) {
    if (typeof arg2 === "boolean")
      return arg2 ? options.fn(this) : options.inverse(this);
    return arg1 == arg2 ? options.fn(this) : options.inverse(this);
  });

  handlebars.registerHelper("ifMax", function (arg1, arg2, options) {
    return arg1 > arg2 ? options.fn(this) : options.inverse(this);
  });

  handlebars.registerHelper("formatDate", function (dateString) {
    return new handlebars.SafeString(
      dayjs(dateString).format("HH:mm / DD.MM.YYYY")
    );
  });

  handlebars.registerHelper("select", function (selected, options) {
    return options
      .fn(this)
      .replace(
        new RegExp(' value="' + selected + '"'),
        '$& selected="selected"'
      );
  });
};
