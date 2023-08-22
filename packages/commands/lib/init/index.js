const Command = require("@cook-cli/command");
const { log } = require("@cook-cli/utils");

class InitCommand extends Command {
  init() {
    this.projectName = this._argv[0] || "";
    this.force = (this._argv[1] && this._argv[1].force) || false;
    log.verbose("projectName", this.projectName);
    log.verbose("force", this.force);
  }

  exec() {
    console.log('exec')
  }
}

const init = (argv) => {
  return new InitCommand(argv);
};

module.exports = init;
