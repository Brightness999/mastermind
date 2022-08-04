/**
 * Route Generator
 */

const routeExists = require('../utils/routeExists');

module.exports = {
  description: 'Add a route component',
  prompts: [
    {
      type: 'list',
      name: 'type',
      message: 'Select the base route type:',
      default: 'Blank',
      choices: () => ['Blank', 'CRUD'],
    },
    {
      type: 'list',
      name: 'typeLink',
      message: 'Select the link type:',
      default: 'Admin',
      choices: () => ['Admin', 'Frontend'],
    },
    {
      type: 'input',
      name: 'name',
      message: 'What should it be called?',
      default: 'PageTest',
      validate: (value) => {
        if ((/.+/).test(value)) {
          return routeExists(value) ? 'A file with this name already exists' : true;
        }
        return 'The name is required';
      },
    },
    {
      type: 'input',
      name: 'title',
      message: 'What is its title?',
      default: 'This is my Title',
      validate: (value) => (/.+/).test(value) ? true : 'The title is required',
    },
    {
      when: (answers) => answers.type === 'CRUD',
      type: 'input',
      name: 'api_0',
      message: 'What is the API path to get the data list?',
      default: '/crud/getList',
    },
    {
      when: (answers) => answers.type === 'CRUD',
      type: 'input',
      name: 'api_1',
      message: 'What is the new data creation API path?',
      default: '/crud/save',
    },
    {
      when: (answers) => answers.type === 'CRUD',
      type: 'input',
      name: 'api_2',
      message: 'What is the path to delete API data?',
      default: '/crud/bathDelete',
    },
    {
      when: (answers) => answers.type === 'CRUD',
      type: 'input',
      name: 'api_3',
      message: 'What is the path to delete API data?',
      default: '/crud/getWorkEmployee',
    }
  ],
  actions: (answers) => {
    // Generate index.js and index.test.js
    let actions;
    answers.linkImport = answers.typeLink === "Admin" ? "" : "../"
    answers.linkPath = answers.typeLink === "Admin" ? "" : "Frontend/"
    switch (answers.type) {
      /*
       * Create a file basic structure CRUD
       */
      case 'CRUD': {
        actions = [
          {
            type: 'add',
            path: '../src/routes/{{linkPath}}{{properCase name}}/index.js',
            templateFile: './route/CRUD/index.js.hbs',
            abortOnFail: true,
          }, {
            type: 'add',
            path: `../src/routes/{{linkPath}}{{properCase name}}/components/index.js`,
            templateFile: './route/CRUD/components/index.js.hbs',
            abortOnFail: true,
          },{
            type: 'add',
            path: `../src/routes/{{linkPath}}{{properCase name}}/components/index.less`,
            templateFile: './route/CRUD/components/index.less.hbs',
            abortOnFail: true,
          },
          {
            type: 'add',
            path: `../src/routes/{{linkPath}}{{properCase name}}/components/columns.js`,
            templateFile: './route/CRUD/components/columns.js.hbs',
            abortOnFail: true,
          },{
            type: 'add',
            path: `../src/routes/{{linkPath}}{{properCase name}}/model/index.js`,
            templateFile: './route/CRUD/model/index.js.hbs',
            abortOnFail: true,
          },{
            type: 'add',
            path: `../src/routes/${answers.typeLink === "Admin" ? "" : "Frontend/"}{{properCase name}}/service/index.js`,
            templateFile: './route/CRUD/service/index.js.hbs',
            abortOnFail: true,
          },
          {
            type: 'add',
            path: `../src/routes/{{linkPath}}{{properCase name}}/messages/index.js`,
            templateFile: './route/CRUD/messages/index.js.hbs',
            abortOnFail: true,
          },
          {
            type: 'modify',
            path: '../src/translations/en.json',
            pattern: /(\n)(})/gi,
            template: `,\n  "routes.{{lowerCase name}}.new": "New",\n  "routes.{{lowerCase name}}.delete": "Delete",\n  "routes.{{lowerCase name}}.modify": "Modify",\n  "routes.{{lowerCase name}}.noticeC": "notice"\n}`,
          },
          {
            type: 'modify',
            path: '../src/translations/vi.json',
            pattern: /(\n)(})/gi,
            template: `,\n  "routes.{{lowerCase name}}.new": "Mới",\n  "routes.{{lowerCase name}}.delete": "Xóa",\n  "routes.{{lowerCase name}}.modify": "Sửa đổi",\n  "routes.{{lowerCase name}}.noticeC": "Thông báo"\n}`,
          }
        ];
        break;
      }
      default: {
        /*
         * Create a file basic structure Blank
         */
        actions = [
          {
            type: 'add',
            path: `../src/routes/{{linkPath}}{{properCase name}}/index.js`,
            templateFile: './route/Blank/index.js.hbs',
            abortOnFail: true,
          }, {
            type: 'add',
            path: `../src/routes/{{linkPath}}{{properCase name}}/components/index.js`,
            templateFile: './route/Blank/components/index.js.hbs',
            abortOnFail: true,
          },{
            type: 'add',
            path: `../src/routes/{{linkPath}}{{properCase name}}/components/index.less`,
            templateFile: './route/Blank/components/index.less.hbs',
            abortOnFail: true,
          },{
            type: 'add',
            path: `../src/routes/{{linkPath}}{{properCase name}}/model/index.js`,
            templateFile: './route/Blank/model/index.js.hbs',
            abortOnFail: true,
          },{
            type: 'add',
            path: `../src/routes/{{linkPath}}{{properCase name}}/service/index.js`,
            templateFile: './route/Blank/service/index.js.hbs',
            abortOnFail: true,
          },
          {
            type: 'add',
            path: `../src/routes/{{linkPath}}{{properCase name}}/messages/index.js`,
            templateFile: './route/Blank/messages/index.js.hbs',
            abortOnFail: true,
          },
          {
            type: 'modify',
            path: '../src/translations/en.json',
            pattern: /(\n)(})/gi,
            template: `,\n  "routes.{{lowerCase name}}.blankPage": "Blank page"\n}`,
          },
          {
            type: 'modify',
            path: '../src/translations/vi.json',
            pattern: /(\n)(})/gi,
            template: `,\n  "routes.{{lowerCase name}}.blankPage": "Trang trống"\n}`,
          }
        ];
      }
    }

    actions.push({
      type: 'modify',
      path: '../src/routes/index.js',
      pattern: /(\n)(const routesConfig)/gi,
      template: `import {{properCase name}} from \'./{{linkPath}}{{properCase name}}\';\n$1$2`,
    });

    if (answers.typeLink === "Admin") {
      actions.push({
        type: 'modify',
        path: '../src/routes/index.js',
        pattern: /(\/\/\ 💬 generate admin to here)/gi,
        template: `$1\n      {{properCase name}}(app),`,
      });
      actions.push({
        type: 'modify',
        path: '../src/routes/constant.js',
        pattern: /(\n)(})/gi,
        template: `,\n  {{ properCase name }}: '/administrator/{{lowerCase name}}'\n}`,
      });
    } else {
      actions.push({
        type: 'modify',
        path: '../src/routes/index.js',
        pattern: /(\/\/\ 💬 generate frontend to here)/gi,
        template: `$1\n      {{properCase name}}(app),`,
      });
      actions.push({
        type: 'modify',
        path: '../src/routes/constant.js',
        pattern: /(\n)(})/gi,
        template: `,\n  {{ properCase name }}: '/{{lowerCase name}}'\n}`,
      });
    }


    return actions;
  },
};
