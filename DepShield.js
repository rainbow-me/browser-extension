/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-plusplus */
/* eslint-disable @typescript-eslint/no-this-alias */
const path = require('path');
const extend = require('util')._extend;
const BASE_ERROR = 'Unauthorized dependency detected:\r\n';
const PluginTitle = 'DepShieldPlugin';
const reportedErrors = [];
class DepShieldPlugin {
  constructor(options) {
    this.options = extend(
      {
        failOnError: false,
        onDetected: false,
        cwd: process.cwd(),
      },
      options,
    );
  }

  apply(compiler) {
    const plugin = this;
    compiler.hooks.compilation.tap(PluginTitle, (compilation) => {
      compilation.hooks.optimizeModules.tap(PluginTitle, (modules) => {
        if (plugin.options.onStart) {
          plugin.options.onStart({ compilation });
        }
        for (const module of modules) {
          const maybeImportingFromRoot = this.isImportingFromRoot(
            module,
            module,
            {},
            compilation,
          );
          if (maybeImportingFromRoot) {
            // This is the target of the attack
            const depPath = [maybeImportingFromRoot.slice(-1)[0]];
            // This is the whole path from our files to the dependency attempting to import
            for (let i = maybeImportingFromRoot.length - 2; i >= 0; i--) {
              const path = maybeImportingFromRoot[i];
              depPath.push(path);
              // Exit after finding the first non-node_modules path
              if (!path.startsWith('node_modules')) {
                break;
              }
            }

            // mark warnings or errors on webpack compilation
            const errorMsg = BASE_ERROR.concat(depPath.reverse().join(' -> '));
            if (reportedErrors.indexOf(errorMsg) === -1) {
              if (plugin.options.failOnError) {
                compilation.errors.push(new Error(errorMsg));
              } else {
                compilation.warnings.push(new Error(errorMsg));
              }
              reportedErrors.push(errorMsg);
            }
          }
        }
        if (plugin.options.onEnd) {
          plugin.options.onEnd({ compilation });
        }
      });
    });
  }

  isImportingFromRoot(initialModule, currentModule, seenModules, compilation) {
    const cwd = this.options.cwd;

    // Add the current module to the seen modules cache
    seenModules[currentModule.debugId] = true;

    // If the modules aren't associated to resources
    // it's not possible to display how they are cyclical
    if (!currentModule.resource || !initialModule.resource) {
      return false;
    }

    // Iterate over the current modules dependencies
    for (const dependency of currentModule.dependencies) {
      if (
        dependency.constructor &&
        dependency.constructor.name === 'CommonJsSelfReferenceDependency'
      ) {
        continue;
      }

      let depModule = null;
      if (compilation.moduleGraph) {
        // handle getting a module for webpack 5
        depModule = compilation.moduleGraph.getModule(dependency);
      } else {
        // handle getting a module for webpack 4
        depModule = dependency.module;
      }

      if (!depModule) {
        continue;
      }
      // ignore dependencies that don't have an associated resource
      if (!depModule.resource) {
        continue;
      }

      // the dependency was resolved to the current module due to how webpack internals
      // setup dependencies like CommonJsSelfReferenceDependency and ModuleDecoratorDependency
      if (currentModule === depModule) {
        continue;
      }

      if (depModule.debugId in seenModules) {
        // THIS IS EXACTLY WHAT WE DON'T WANT TO ALLOW:
        // a module from `node_modules`
        // requiring a module that is not from `node_modules` (i.e. a local file)
        const relCurrentModule = path.relative(cwd, currentModule.resource);
        const relDepModule = path.relative(cwd, depModule.resource);

        if (
          relCurrentModule.startsWith('node_modules/') &&
          !relDepModule.startsWith('node_modules/')
        ) {
          return [
            path.relative(cwd, relCurrentModule),
            path.relative(cwd, relDepModule),
          ];
        }
        continue;
      }

      const maybeImportingFromRoot = this.isImportingFromRoot(
        initialModule,
        depModule,
        seenModules,
        compilation,
      );
      if (maybeImportingFromRoot) {
        maybeImportingFromRoot.unshift(
          path.relative(cwd, currentModule.resource),
        );
        return maybeImportingFromRoot;
      }
    }

    return false;
  }
}

module.exports = DepShieldPlugin;
