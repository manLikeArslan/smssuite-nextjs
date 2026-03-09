
const listSize = 1000;
const iterations = 100000;
const lists = Array.from({ length: listSize }, (_, i) => ({ id: `id-${i}`, count: i, name: `List ${i}` }));
const selectedListId = `id-${listSize - 1}`;

console.log(`Benchmarking with ${listSize} lists and ${iterations} iterations.`);

// 1. Baseline: .find() every time
console.time('find-baseline');
for (let i = 0; i < iterations; i++) {
    const selectedList = lists.find(l => l.id === selectedListId);
}
console.timeEnd('find-baseline');

// 2. Optimized: Simulated memoization (runs find only when dependencies change)
// In our case, during countdown, dependencies don't change.
console.time('memoized-sim');
let cachedSelectedList = null;
let lastLists = null;
let lastId = null;

for (let i = 0; i < iterations; i++) {
    // Simulate render where dependencies haven't changed most of the time
    // For this benchmark, we assume they never change within the loop
    if (lists !== lastLists || selectedListId !== lastId) {
        cachedSelectedList = lists.find(l => l.id === selectedListId);
        lastLists = lists;
        lastId = selectedListId;
    }
    const selectedList = cachedSelectedList;
}
console.timeEnd('memoized-sim');

// 3. Map lookup (if we were to use a Map)
console.time('map-creation');
const map = new Map(lists.map(l => [l.id, l]));
console.timeEnd('map-creation');

console.time('map-lookup');
for (let i = 0; i < iterations; i++) {
    const selectedList = map.get(selectedListId);
}
console.timeEnd('map-lookup');
