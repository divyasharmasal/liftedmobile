/**
 * Function that mutates original webpack config.
 * Supports asynchronous changes when promise is returned. 
 * 
 * @param {object} config - original webpack config.
 * @param {object} env - options passed to CLI.
 * @param {WebpackConfigHelpers} helpers - object with useful helpers when
 * working with config.
 **/

export default function (config, env, helpers) {
  // Mutate config if in production 
  config.output.publicPath = "/static/app/dist/";

  if (process.env.PREACT_PROD === "true"){
    // Disable sourcemaps
    let uglifyPlugins = helpers.getPluginsByName(config, "UglifyJsPlugin");
    if (uglifyPlugins.length > 0){
      uglifyPlugins[0].plugin.options.sourceMap = false;
    }
  }
}
