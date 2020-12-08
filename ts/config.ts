

export var options = {
  random: Math.random.bind(Math),
  colorLookup: ((_:string): any => null),
}

export function configure(opts={}) {
  Object.assign(options, opts);
}

