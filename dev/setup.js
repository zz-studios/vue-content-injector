(async () => {
  // const path = require('path')

  // (function () {
  //   var childProcess = require("child_process");
  //   var oldSpawn = childProcess.spawn;
  //   function mySpawn() {
  //     console.log('spawn called');
  //     console.log(arguments);
  //     var result = oldSpawn.apply(this, arguments);
  //     return result;
  //   }
  //   childProcess.spawn = mySpawn;
  // })();

  const { execSync, spawn } = require('child_process')

  var { readdirSync, lstatSync } = require('fs')
  var { join, dirname } = require('path')
  const isDirectory = source => lstatSync(source).isDirectory()


  const spawnAndResolve = ({ name, cwd }, cmd, args) => {
    return new Promise((resolve, reject) => {
      const npmSpawn = spawn(cmd, args, { cwd, shell: true })
      npmSpawn.stdout.on('data', data => console.log('*** ' + name + ', out: ' + data.toString()))
      npmSpawn.stderr.on('data', data => console.log('*** ' + name + ', err: ' + data.toString()))
      npmSpawn.on('exit', code => {
        console.log('*** ' + name + ' exited with code ' + code.toString())
        if (code == 0) {
          resolve()
        } else {
          reject()
        }
      })
    })
  }

  const excludeFolders = ['node_modules', 'src', 'dist']

  const findAllPackageFiles = () => {
    const ret = []
    const findAllPackageFilesInt = (thePath) => {
      readdirSync(thePath).forEach(item => {
        const itemPath = join(thePath, item)
        if (item == 'package.json') {
          ret.push(itemPath)
        } else if (isDirectory(itemPath) && !excludeFolders.includes(item)) {
          findAllPackageFilesInt(itemPath)
        }

      })
    }

    findAllPackageFilesInt('..\\apis')
    findAllPackageFilesInt('..\\prop-injector')
    findAllPackageFilesInt('..\\sources')
    findAllPackageFilesInt('..\\test')

    console.log('ret', ret)
    return ret
  }
  const delay = ms => new Promise(res => setTimeout(res, ms))

  const buildPackageDependencies = async () => {
    const packageFiles = findAllPackageFiles()
    const packageDependencies = packageFiles.map(packageFile => {
      const package = require(packageFile)

      const dependencies = [
        ...Object.keys(package.devDependencies),
        ...Object.keys(package.peerDependencies),
        ...Object.keys(package.dependencies)
      ].filter(d => d.startsWith('@zz-studios/'))

      const cwd = dirname(packageFile)
      const name = package.name
      const status = 0
      return { name, packageFile, dependencies, cwd, status }
    })

    console.log('packageDependencies', packageDependencies)
    while (packageDependencies.some(pd => pd.status != 3)) { // keep looping while we still have some incomplete
      // for (let i = 0; i < packageDependencies.length; i++) { // we know we need to loop this many times, but not necessarily in this order!
      const package = packageDependencies.find(pd => pd.dependencies.length == 0 && pd.status == 0) // get the first one with no internal dependencies
      if (!package) { // none ready yet, wait a bit and then continue
        console.log(packageDependencies.map(p => ({ name: p.name, status: p.status })))
        console.log('no packages ready, waiting...')
        await delay(1000)
        continue
      }
      console.log('package: ' + package.name + ' ready.')
      // TODO: 
      // npm i
      // npm link
      // npm link the other
      // remove dependecy from other

      package.status = 1
      // TODO: gulpify this 
      const { name, cwd } = package

      spawnAndResolve(package, 'npm', ['i']).then(() => {
        spawnAndResolve(package, 'npm', ['run', 'build']).then(() =>
          spawnAndResolve(package, 'npm', ['link']).then(() => {
            packageDependencies.forEach(pd => {
              const dpackageIndex = pd.dependencies.findIndex(d => d == name)
              if (dpackageIndex == -1) {
                return // this package doesn't have a depency on us
              }

              // link this project to the current project
              spawnAndResolve(pd.dependencies[dpackageIndex], 'npm', ['link']).then(() => {

                // remove this as a depency we still need to worry about
                pd.dependencies.splice([dpackageIndex])
                package.status = 3
              })
            })
          })
        )
      })
    }
  }
  // setupSqlite() = () => {
  //   // npm i -g windows-build-tools
  //   // npm i node-gyp
  // }

  // setupSqlite()

  await buildPackageDependencies()
})()