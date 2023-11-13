export const uniqueIDs = (array) => {
    return array.map(String).filter((x, i, arr) => arr.indexOf(x) === i);
};