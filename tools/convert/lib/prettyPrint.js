


export const prettyPrint = (src, instrumentNames = []) => {
  let stack = [];
  let index = 0;
  let depth = 0;
  let maxDepths=[1,2,0,0];

  return [...src].map(chr => {
    const rootIndex = stack[0] || 0
    const maxDepth = maxDepths[rootIndex]

    if (chr === '[' || chr === '{') {
      index = 0;
      stack.push(index);
      depth = stack.length - 1;

      // If this is an instrument, add a comment to ease editing
      if (rootIndex === 0 && depth === 2) {
        chr = `/* ${instrumentNames[stack[depth-1]].substr(0,22).padEnd(24,' ')} */ ` + chr;
      }

      // If this is a pattern add a comment
      else if (rootIndex === 1 && depth === 2) {
        chr = `/* Pattern ${stack[depth-1]} */ ` + chr;
      }

      // If this is a channel, add a comment
      else if (rootIndex === 1 && depth === 3) {
        chr = `/* Channel ${stack[depth-1]} */ ` + chr;
      }

      if (depth > maxDepth) {
        return chr
      }
      const indent = '  '.repeat(depth + 1);
      return chr + '\n' + indent;
    }

    if (chr === ']' || chr === '}') {
      index = stack.pop();
      depth = stack.length - 1;

      if (depth >= maxDepth) {
        return chr
      }
      const indent = '  '.repeat(depth + 1);
      return '\n' + indent + chr
    }

    if (chr === ',') {
      depth = stack.length - 1;
      index = stack[depth];
      stack[depth]++;

      if (depth > maxDepth) {
        return chr
      }
      const indent = '  '.repeat(depth + 1);
      return chr + '\n' + indent
    }
    return chr;
  }).join('')
  return src.replace(/(\[[^\[]+?)/,'\n$1')
}
