export function shouldLoadShed() {
  if (process.env.LOAD_SHED_ENABLED !== "true") return false;
  return false;
}
