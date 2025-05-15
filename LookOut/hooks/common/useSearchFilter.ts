import { useState, useMemo } from "react";

/**
 * Manages a search box state and returns the items
 * filtered by your predicate.
 *
 * @param items - the full array of items to filter
 * @param predicate - (item, term) => boolean
 * @returns {
*   term: string,
*   setTerm: (t: string) => void,
*   filtered: T[]
* }
*/

export function useSearchFilter<T>(
 items: T[],
 predicate: (item: T, term: string) => boolean
) {
 const [term, setTerm] = useState("");
 const filtered = useMemo(
   () => items.filter((item) => predicate(item, term)),
   [items, term]
 );
 return { term, setTerm, filtered };
}
