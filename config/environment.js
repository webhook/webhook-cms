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
  controlTypeGroups: [
    {
      name: 'Text',
      controlTypes: [
        {
          name     : 'Single line text',
          iconClass  : 'icon-font'
        },
        {
          name     : 'Paragraph text',
          iconClass  : 'icon-align-left',
          widget   : 'textarea'
        },
        {
          name     : 'WYSIWYG text',
          iconClass  : 'icon-magic',
          widget   : 'wysiwyg',
        },
        {
          name     : 'Markdown text',
          iconClass  : 'icon-markdown-mark',
          widget   : 'markdown',
          help     : 'Learn about Markdown syntax <a href="http://guides.github.com/overviews/mastering-markdown/" target="_blank">here</a>'
        }
      ]
    }, {
      name: 'Basics',
      controlTypes: [
        {
          name  : 'Number',
          widget: 'number',
          iconClass  : 'icon-list-ol'
        },
        {
          name  : 'Checkbox',
          widget: 'checkbox',
          iconClass  : 'icon-checkbox-checked'
        },
        {
          name  : 'Multiple choice',
          widget: 'radio',
          iconClass  : 'icon-radio-checked'
        },
        {
          name  : 'Dropdown',
          widget: 'select',
          iconClass  : 'icon-menu'
        }
      ]
    }, {
      name: 'Files',
      controlTypes: [
        {
          name  : 'Image',
          widget: 'image',
          iconClass  : 'icon-image'
        },
        {
          name: 'Gallery',
          iconClass  : 'icon-images'
        },
        {
          name  : 'Audio file',
          widget: 'audio',
          iconClass  : 'icon-music'
        },
        {
          name  : 'Other file',
          widget: 'file',
          iconClass  : 'icon-paper-clip'
        }
      ]
    }, {
      name: 'Specifics',
      controlTypes: [
        {
          name     : 'Name',
          widget   : 'name',
          valueType: 'object',
          iconClass  : 'icon-user'
        },
        {
          name     : 'Address',
          widget   : 'address',
          valueType: 'object',
          iconClass  : 'icon-direction'
        },
        {
          name  : 'Phone number',
          widget: 'phone',
          iconClass  : 'icon-phone-sign'
        },
        {
          name  : 'Email',
          widget: 'email',
          iconClass  : 'icon-envelop'
        },
        {
          name  : 'Date time',
          widget: 'datetime',
          iconClass  : 'icon-calendar'
        },
        {
          name       : 'Website',
          widget     : 'url',
          label      : 'Website',
          placeholder: 'http://www.sitename.com',
          iconClass  : 'icon-link'
        },
        {
          name  : 'Rating',
          widget: 'rating',
          iconClass  : 'icon-star'
        },
        {
          name  : 'Tags',
          widget: 'tag',
          iconClass  : 'icon-tags'
        }
      ]
    }
  ]
};
