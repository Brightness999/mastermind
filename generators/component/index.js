/**
 * Component Generator
 */

const componentExists = require('../utils/_componentExists');

module.exports = {
  description: 'Add a component',
  prompts: [
    {
      type: 'list',
      name: 'type',
      message: 'Select the base component type:',
      default: 'Stateless',
      choices: () => ['Stateless', 'Component'],
    },
    {
      type: 'input',
      name: 'name',
      message: 'What should it be called?',
      default: 'ComponentTest',
      validate: (value) => {
        if ((/.+/).test(value)) {
          return componentExists(value) ? 'A file with this name already exists' : true;
        }
        return 'The name is required';
      },
    },
  ],
  actions: (answers) => {
    // Generate index.js and index.test.js
    let actions;
    switch (answers.type) {
      default: {
        /*
         * Create a file basic structure component
         */
        actions = [{
          type: 'add',
          path: '../src/components/{{properCase name}}/index.js',
          templateFile: `./component/Default/${answers.type}.hbs`,
          abortOnFail: true,
        }, {
          type: 'add',
          path: '../src/components/{{properCase name}}/messages/index.js',
          templateFile: './component/Default/messages/index.js.hbs',
          abortOnFail: true,
        },{
          type: 'add',
          path: '../src/components/{{properCase name}}/style/index.less',
          templateFile: './component/Default/style/index.less.hbs',
          abortOnFail: true,
        }];
      }
    }

    actions.push({
      type: 'modify',
      path: '../src/translations/en.json',
      pattern: /(\n)(})/gi,
      template: `,\n  "components.{{lowerCase name}}.test": "{{properCase name}}"\n}`,
    });

    actions.push({
      type: 'modify',
      path: '../src/translations/vi.json',
      pattern: /(\n)(})/gi,
      template: `,\n  "components.{{lowerCase name}}.test": "{{properCase name}}"\n}`,
    });

    return actions;
  },
};
