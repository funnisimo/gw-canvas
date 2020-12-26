export var options = {
    random: Math.random.bind(Math),
};
export function configure(opts = {}) {
    Object.assign(options, opts);
}
