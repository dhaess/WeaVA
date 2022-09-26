// if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
//     const errorFn = global.console.error;
//     const warnFn = global.console.warn;
//
//     const contains = (target, pattern) => {
//         let value = 0;
//         pattern.forEach(word => (value = value + target.includes(word)));
//         return value === 1;
//     };
//
//     const ignoreListError = [
//         'The `fade` color utility was renamed to `alpha` to better describe its functionality.',
//     ];
//
//     const ignoreListWarn = ['The `theme.typography.round` helper is deprecated.'];
//
//     global.console.error = msg => {
//         if (!(typeof msg === 'string' && msg.indexOf('Material-UI') !== -1 && contains(msg, ignoreListError))) {
//             errorFn(msg);
//         }
//     };
//
//     global.console.warn = msg => {
//         if (!(typeof msg === 'string' && msg.indexOf('Material-UI') !== -1 && contains(msg, ignoreListWarn))) {
//             warnFn(msg);
//         }
//     };
// }
//
// export {};
