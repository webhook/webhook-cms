// Put general configuration here. This file is included
// in both production and development BEFORE Ember is
// loaded.
//
// For example to enable a feature on a canary build you
// might do:
//
// window.ENV = {FEATURES: {'with-controller': true}};

window.ENV = {
  dbName: 'ianbox',
  dbBucket: 'buckets/test/5e13aef1-8aa8-41b4-8619-2eaf62c0ae49/dev',
  controlTypeGroups: [
    {
      name: 'Text',
      controlTypes: [
        {
          name     : 'Single line text',
          faClass  : 'fa-font'
        },
        {
          name     : 'Paragraph text',
          faClass  : 'fa-align-left',
          widget   : 'textarea'
        },
        {
          name     : 'WYSIWYG text',
          faClass  : 'fa-magic',
          widget   : 'wysiwyg',
        },
        {
          name     : 'Markdown text',
          faClass  : 'fa-tag',
          widget   : 'markdown',
          help     : 'Learn about Markdown syntax <a href="http://guides.github.com/overviews/mastering-markdown/" target="_blank">here</a>'
        }
      ]
    }, {
      name: 'Basics',
      controlTypes: [
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
      controlTypes: [
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
      controlTypes: [
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
