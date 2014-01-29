// Put general configuration here. This file is included
// in both production and development BEFORE Ember is
// loaded.
//
// For example to enable a feature on a canary build you
// might do:
//
// window.ENV = {FEATURES: {'with-controller': true}};

window.ENV = {
  dbName: 'hooktest',
  dbBucket: 'site/dev',
  fieldTypeGroups: [
    {
      name: 'Text',
      fields: [
        {
          name     : 'Single line text',
          iconClass: 'icon-font'
        },
        {
          name     : 'Paragraph text',
          iconClass: 'icon-align-left',
          widget   : 'textarea'
        },
        {
          name     : 'WYSIWYG text',
          iconClass: 'icon-magic',
          widget   : 'wysiwyg',
        },
        {
          name     : 'Markdown text',
          iconClass: 'icon-tag',
          widget   : 'markdown',
          help     : 'Learn about Markdown syntax <a href="http://guides.github.com/overviews/mastering-markdown/" target="_blank">here</a>'
        }
      ]
    }, {
      name: 'Basics',
      fields: [
        {
          name  : 'Number',
          widget: 'number'
        },
        {
          name  : 'Checkbox',
          widget: 'checkbox'
        },
        {
          name  : 'Multiple choice',
          widget: 'radio'
        },
        {
          name  : 'Dropdown',
          widget: 'select'
        }
      ]
    }, {
      name: 'Files',
      fields: [
        {
          name  : 'Image',
          widget: 'image'
        },
        {
          name: 'Gallery'
        },
        {
          name  : 'Audio file',
          widget: 'audio'
        },
        {
          name  : 'Other file',
          widget: 'file'
        }
      ]
    }, {
      name: 'Specifics',
      fields: [
        {
          name  : 'Name',
          widget: 'name'
        },
        {
          name  : 'Address',
          widget: 'address'
        },
        {
          name  : 'Phone number',
          widget: 'phone'
        },
        {
          name  : 'Email',
          widget: 'email'
        },
        {
          name  : 'Date time',
          widget: 'datetime'
        },
        {
          name       : 'Website',
          widget     : 'url',
          label      : 'Website',
          placeholder: 'http://www.sitename.com'
        },
        {
          name  : 'Rating',
          widget: 'rating'
        },
        {
          name  : 'Tags',
          widget: 'tag'
        }
      ]
    }
  ]
};
