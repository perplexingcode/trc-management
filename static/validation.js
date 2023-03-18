export function errConditionWrapper(errorObj, errorName, condition) {
  if (condition) {
    errorObj[errorName].stt = false;
    return true;
  } else {
    errorObj[errorName].stt = true;
    return false;
  }
}
