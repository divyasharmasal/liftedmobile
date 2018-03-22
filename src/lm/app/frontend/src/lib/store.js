const storedOptsKey = "s";

const clearSelectedItems = () => {
  sessionStorage.removeItem(storedOptsKey);
}

const storeSelectedOpts = (obj) => {
  sessionStorage.setItem(storedOptsKey, JSON.stringify(obj));
}


const getSelectedOpts = () => {
  const opts = sessionStorage.getItem(storedOptsKey);
  if (opts == null){
    return {}
  }
  else{
    return JSON.parse(opts);
  }
}

export { getSelectedOpts, storeSelectedOpts, clearSelectedItems };
