import {spawnSync} from 'child_process'
import {writeFileSync, readFileSync} from 'jsonfile'
import { unlinkSync, existsSync, readdirSync, renameSync } from 'fs';

const buildUsingWebpack = (option: object) => {
    spawnSync('npm',['run', `build-${option['appName']}`],{stdio: 'inherit'})
}

const buildVanillaJS = (option: object) => {

}

const buildPlugin = (option: object) => {
    let manifestJSON = {}

    manifestJSON['manifest_version'] = 1
    manifestJSON['version'] = 1
    manifestJSON['type'] = 'APP'
    manifestJSON['icon'] = option['icon']
    manifestJSON['name'] = {
        "en": option['appName']
    }
    manifestJSON['description'] = {
        "en": "Kintone Plugin"
    }
    manifestJSON['desktop'] = option['uploadConfig']['desktop']
    manifestJSON['mobile'] = option['uploadConfig']['mobile']
    
    writeFileSync(`manifest.json`,manifestJSON,{spaces: 4, EOL: "\r\n"})

    let paramArr = ['./' ,'--out', `${option['appName']}/dist/plugin.zip`]
    if (existsSync(`${option['appName']}/dist/private.ppk`)) {
        paramArr.push('--ppk')
        paramArr.push(`${option['appName']}/dist/private.ppk`)
    }
    spawnSync(
        './node_modules/.bin/kintone-plugin-packer',
        paramArr,
        {
            stdio: 'inherit'
        }
    )

    if (!existsSync(`${option['appName']}/dist/private.ppk`)) {
        let keyFileName = readdirSync(`${option['appName']}/dist`).filter((name: string)=>{
            return /.ppk$/.test(name)
        })
        renameSync(`${option['appName']}/dist/${keyFileName[0]}`,`${option['appName']}/dist/private.ppk`)
        //console.log(keyFileName)
    }

    unlinkSync(`manifest.json`)
}

const builder = {
    buildUsingWebpack: buildUsingWebpack,
    buildVanillaJS: buildVanillaJS,
    buildPlugin: buildPlugin
}

export default builder
export {
    buildUsingWebpack,
    buildVanillaJS,
    buildPlugin
}