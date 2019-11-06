module.exports = {
  convertFromCamelCase: function (string) {
    const result = string.replace(/([A-Z0-9])/g, " $1");
    return result.charAt(0).toUpperCase() + result.slice(1);
  }
};
