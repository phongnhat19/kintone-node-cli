"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = require("chalk");
const jsonfile_1 = require("jsonfile");
const child_process_1 = require("child_process");
const strip_ansi_1 = require("strip-ansi");
const fs_1 = require("fs");
const devGenerator_1 = require("./devGenerator");
const validator_1 = require("./validator");
const isURL = (str) => {
    var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
    return !!pattern.test(str);
};
const devCommand = (program) => {
    program
        .command('dev')
        .option('--watch', 'Watch for changes in source code')
        .option('--appName <appName>', 'Watch for changes in source code')
        .action((cmd) => __awaiter(this, void 0, void 0, function* () {
        let error = validator_1.default.devValidator(cmd);
        if (error && typeof error === 'string') {
            console.log(chalk_1.default.red(error));
            return;
        }
        process.on('SIGINT', () => {
            process.exit();
        });
        let watching = false;
        // build the first time and upload link to kintone
        if (fs_1.existsSync(`${cmd.appName}/webpack.config.js`)) {
            console.log(chalk_1.default.yellow('Building distributed file...'));
            child_process_1.spawnSync('npm', ['run', `build-${cmd.appName}`, '--', '--mode', 'development'], { stdio: ['ignore', 'ignore', process.stderr] });
        }
        console.log(chalk_1.default.yellow('Starting local webserver...'));
        const ws = child_process_1.spawn('npm', ['run', 'dev', '--', '--https']);
        ws.stderr.on('data', (data) => {
            let webserverInfo = data.toString().replace('Serving at', '');
            webserverInfo = webserverInfo.split(',');
            const serverAddr = strip_ansi_1.default(webserverInfo[0].trim());
            let config = jsonfile_1.readFileSync(`${cmd['appName']}/config.json`);
            config.uploadConfig.desktop.js = config.uploadConfig.desktop.js.map((item) => {
                if (!isURL(item))
                    return `${serverAddr}/${item}`;
                return item;
            });
            config.uploadConfig.mobile.js = config.uploadConfig.mobile.js.map((item) => {
                if (!isURL(item))
                    return `${serverAddr}/${item}`;
                return item;
            });
            config.uploadConfig.desktop.css = config.uploadConfig.desktop.css.map((item) => {
                if (!isURL(item))
                    return `${serverAddr}/${item}`;
                return item;
            });
            config.watch = cmd.watch;
            if (!watching) {
                watching = true;
                if (config.type === 'Customization') {
                    devGenerator_1.devCustomize(ws, config);
                }
                else if (config.type === 'Plugin') {
                    devGenerator_1.devPlugin(ws, config);
                }
            }
        });
    }));
};
exports.default = devCommand;
//# sourceMappingURL=devCommand.js.map