// Replacements of the lodash collection functions the app used (lodash was ~60 kB of the bundle).
// Many store collections are objects keyed by code name, so these accept arrays, objects (their values)
// and null/undefined (empty), like lodash did.

type SortKey<T> = keyof T | ((item: T) => unknown);
type SortOrder = 'asc' | 'desc';

// values of an object, or the array itself (not a copy).
// Typed like lodash: with an untyped (any) collection the items are any
function values<T>(collection: readonly T[] | null | undefined): T[];
function values<T extends object>(collection: T | null | undefined): T[keyof T][];
function values(collection: any): any[] {
  if (collection === null || collection === undefined) {
    return [];
  }

  return Array.isArray(collection) ? collection : Object.values(collection);
}

// as lodash: null then undefined after the other values in ascending order
const missingRank = (value: any): number => {
  if (value === undefined) {
    return 2;
  }

  return value === null ? 1 : 0;
};

const compareValues = (a: any, b: any): number => {
  const aRank = missingRank(a);
  const bRank = missingRank(b);

  if (aRank !== 0 || bRank !== 0) {
    return aRank - bRank;
  }

  if (a < b) {
    return -1;
  }

  return a > b ? 1 : 0;
};

// stable sort on several keys, returns a new array
function orderBy<T>(collection: readonly T[] | null | undefined, keys: SortKey<T>[], orders?: SortOrder[]): T[];
function orderBy<T extends object>(
  collection: T | null | undefined, keys: SortKey<T[keyof T]>[], orders?: SortOrder[]
): T[keyof T][];
function orderBy(collection: any, keys: SortKey<any>[], orders: SortOrder[] = []): any[] {
  const getters = keys.map(key => (typeof key === 'function' ? key : (item: any) => item[key]));

  return [...values(collection)].sort((a, b) => {
    for (let i = 0; i < getters.length; i += 1) {
      const result = compareValues(getters[i](a), getters[i](b));

      if (result !== 0) {
        return orders[i] === 'desc' ? -result : result;
      }
    }

    return 0;
  });
}

function sortBy<T>(collection: readonly T[] | null | undefined, key: SortKey<T>): T[];
function sortBy<T extends object>(collection: T | null | undefined, key: SortKey<T[keyof T]>): T[keyof T][];
function sortBy(collection: any, key: SortKey<any>): any[] {
  return orderBy(collection, [key]);
}

export { values, orderBy, sortBy };
