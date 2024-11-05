type _DataType = number | string;

const getExportData = <T>(dataType: string, value: _DataType): T => {
  switch (dataType) {
    case 'number':
      return parseInt(value as string) as T;
    case 'string':
      return value as T;
    default:
      return value as T;
  }
};

class _Storage {
  load<T>(key: string): T {
    return localStorage.getItem(key) as T;
  }
  loadValueByKey<T>(key: string, defaultValue: _DataType): T {
    const value = localStorage.getItem(key);
    /* found value */
    if (value) {
      this._cache[key] = value;
      return getExportData(typeof defaultValue, value);
    } else {
      /* init new value */
      localStorage.setItem(key, typeof defaultValue === 'number' ? defaultValue.toString() : defaultValue);
      return defaultValue as T;
    }
  }
  setValueByKey(key: string, value: _DataType) {
    localStorage.setItem(key, typeof value === 'number' ? value.toString() : value);
  }

  private _cache: { [key: string]: _DataType } = {};
}

export const Storage = new _Storage();
