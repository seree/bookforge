// Invariant companion for the `bookforge` package.
// Follows the DSH convention: every plugin package publishes a `./invariant`
// companion that reserves its npm package name in the invariants registry.
"use strict";

const PACKAGE_NAME = "bookforge";
const name = "tool-bookforge-invariant";
const inject = ["invariants"];

// No runtime invariant: the bookforge tool is a thin shell-out adapter over the
// BookForge CLI; stage correctness is owned by the CLI itself and its test suite.
const install = () => {};

const apply = (ctx) => Promise.resolve(ctx.invariants.register(PACKAGE_NAME, install));

module.exports = { apply, inject, name };
