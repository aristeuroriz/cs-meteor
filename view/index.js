'use strict';
let generators = require('yeoman-generator');
let fs = require('fs');
let path = require('path');
let mkdirp = require('mkdirp');
let _ = require('lodash');
let lodash_inflection = require('lodash-inflection');

module.exports = generators.Base.extend({
  constructor: function() {
    generators.Base.apply(this, arguments);
    if (this._getResources().length < 1) this.env.error('You should have at least one resource!');
  },

  _getResources() {
    if (typeof this.resources === 'undefined') {
      this.resources = fs.readdirSync(
        this.destinationPath('lib/collections')
      ).map(elem => path.basename(elem, '.js'));
    }
    return this.resources;
  },

  prompting: function() {
    let done = this.async();

    this.prompt([
      {
        message: 'What kind of view?',
        type: 'list',
        default: 'list',
        choices: ['list', 'show', 'new', 'edit'],
        name: 'kind'
      },
      {
        message: 'For which resource?',
        type: 'list',
        choices: this._getResources(),
        name: 'resource'
      },
      {
        message: 'Should I create the route for you?',
        type: 'confirm',
        name: 'route'
      }],
    answers => {
      this.kind = answers.kind;
      this.resource = answers.resource;
      this.route = answers.route;
      done();
    });
  },

  configuring: function() {
  },

  writing: function() {
    mkdirp(`client/templates/${this.resource}`);
    let path, template, group = _.capitalize(this.resource.toLowerCase());
    switch (this.kind) {
      case 'list':
        path = `/${group.toLowerCase()}/`;
        template = `list${group}`;
        break;
      case 'show':
        path = `/${group.toLowerCase()}/:_id`;
        template = `show${group}`;
        break;
      case 'new':
        path = `/${group.toLowerCase()}/new`;
        template = `new${group}`;
        break;
      case 'edit':
        path = `/${group.toLowerCase()}/:_id/edit`;
        template = `edit${group}`;
        break;
    }

    let options = {
      template,
      tableTitle: _.capitalize(lodash_inflection.pluralize(this.resource.toLowerCase())),
      resource: lodash_inflection.pluralize(this.resource.toLowerCase()),
      group
    };

    this.fs.copyTpl(
      this.templatePath(`blaze/${this.kind}.html.ejs`),
      this.destinationPath(`client/templates/${this.resource}/${this.kind}.html`),
      options
    );
    this.fs.copyTpl(
      this.templatePath(`blaze/${this.kind}.js.ejs`),
      this.destinationPath(`client/templates/${this.resource}/${this.kind}.js`),
      options
    );

    if (this.route) {
      this.composeWith('joker:route', { options: {
        group,
        name: template,
        path,
        template
      }});
    }
  }
});
