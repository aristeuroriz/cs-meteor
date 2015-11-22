'use strict';

let mkdirp = require('mkdirp');
let path = require('path');

module.exports = class {
  static writing(self) {
    mkdirp.sync('client/templates/layouts');

    ['default.html.ejs', 'default.css.ejs'].forEach(
      file => {
        self.fs.copyTpl(
          self.templatePath(`blaze/${file}`),
          self.destinationPath(`client/templates/layouts/${path.basename(file, '.ejs')}`),
          {
            appname: self.config.get('appname')
          }
        );
      }
    );

    [`toJSON.js.ejs`,
      `schemas.js.ejs`,
      `collections.js.ejs`].forEach(
        file => {
          self.fs.copyTpl(
            self.templatePath(`blaze/${file}`),
            self.destinationPath(`lib/helpers/${path.basename(file, '.ejs')}`)
          );
        }
      );
    }
  }
