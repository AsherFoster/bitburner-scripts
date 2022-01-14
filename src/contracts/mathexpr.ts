type Operator = '+' | '-' | '*';
const operators: Operator[] = ['*', '-', '+'];
const negOperators: Operator[] = ['*']; // + -3 doesn't make much sense

interface Node {
  name: Operator;
  left: Tree;
  right: Tree;
}
interface Leaf {
  name: number;
  left: null;
  right: null;
}
type Tree = Node | Leaf;

function createTree(tokens: (number | Operator)[]): Tree {
  if (tokens.length == 0) throw new Error('Huh');
  if (tokens.length == 1) return { name: tokens[0] as number, left: null, right: null };

  // find the highest precedence operator,
  let opIndex = -1;
  for (const operator of operators) {
    opIndex = tokens.lastIndexOf(operator); // 1 - 2 - 3 - 4 should be ((1 - 2) - 3) - 4
    if (opIndex > -1) break;
  }

  if (opIndex === -1) throw new Error('Couldn\'t find op');

  return {
    name: tokens[opIndex] as Operator,
    left: createTree(tokens.slice(0, opIndex)),
    right: createTree(tokens.slice(opIndex + 1))
  };
}

function evaluateExpression(expr: Tree): number {
  if (expr.left && expr.right) {
    const left = evaluateExpression(expr.left);
    const right = evaluateExpression(expr.right);

    switch (expr.name) {
      case '*':
        return left * right;
      case '+':
        return left + right;
      case '-':
        return left - right;
      default:
        throw new Error('unrecognised operator :(');
    }
  }
  return expr.name;
}

function printExpr(expr: Tree): string {
  if (expr.left && expr.right) return [printExpr(expr.left), expr.name, printExpr(expr.right)].join(' ');
  else return expr.name.toString();
}

// How about we uhhhhm just skip over this function
function parseVariations(input: string): (number | Operator)[][] {
  // At the high end, get each possible token to pull off the front, adding each variation of the rest to that
  // At the low end, if there's no variations left, return each

  if (input.startsWith('0') && input.length > 1) return []; // we can't start a token with 0
  const possibilities: (number | Operator)[][] = [];

  // TODO might be more efficient to use the original algo and then permute negative signs
  for (let thisTokenLen = 1; thisTokenLen <= input.length; thisTokenLen++) {
    const thisToken = parseInt(input.substring(0, thisTokenLen));
    if (input.length > thisTokenLen) {
      possibilities.push(
        ...parseVariations(input.substring(thisTokenLen)) // add every variant of the rest of this input
          .flatMap(next => (next[0] >= 0 ? operators : negOperators).flatMap(op => [
            [thisToken, op, ...next],
            [-thisToken, op, ...next]
          ]))
      );
    } else possibilities.push([thisToken], [-thisToken]); // No chars after this token, return it
  }

  return possibilities;
}

export default {
  type: 'Find All Valid Math Expressions',
  description: /add the \+, -, and \* operators/,
  solve([input, target]: [string, number]): string[] {
    // a string of 4 numbers has 3 places we can put stuff
    // TODO can we prefix numbers with a negative symbol?

    // 3 places, each with 4 options (+, -, *, )
    // 5^3 = 125 combinations
    // (if we can prefix numbers with -, this becomes 2000, still manageable)

    // Get all the possible valid expressions
    return parseVariations(input)
      .map(tokens => createTree(tokens))
      // .map((expr) => {
      //   console.log(printExpr(expr), '=', evaluateExpression(expr), expr);
      //   return expr;
      // })
      .filter(expr => evaluateExpression(expr) === target)
      .map(expr => printExpr(expr));
  }
};
