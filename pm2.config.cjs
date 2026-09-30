module.exports = {
  apps: [{
    name: 'hahabot',
    script: './index.js',
    watch: [
      'commands',
      'config',
      'events',
      'handlers',
      'utils',
      'index.js',
    ],
    watch_options: {
      followSymlinks: false,
    },
    log_date_format: 'DD_MM HH:mm',
    error_file: 'hahabot_error.log',
    out_file: 'hahabot_out.log',
    node_args: '--trace-warnings --disable-wasm-trap-handler',
  }],
};
