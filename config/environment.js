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
  uploadUrl: 'http://server.webhook.com:3000/',
  embedlyKey: '13dde81b8137446e89c7933edca679eb',
  displayUrl : 'https://i.embed.ly/1/display/',

  themes: [
    {
      name:  'Podcast + Blog',
      image: 'https://raw.githubusercontent.com/webhook/webhook-theme-podcast/master/static/images/theme-screenshot.png',
      url:   'https://github.com/webhook/webhook-theme-podcast/archive/master.zip',
      demo:  'http://www.dadstrength.tv',
      code:  'https://github.com/webhook/webhook-theme-podcast/archive/master.zip',
      description: 'Podcast theme with simple blog. Comes with a persistant audio player and iTunes formatted RSS.'
    },
    {
      name:  'Bootstrap Blog',
      image: 'https://raw.github.com/snide/webhook-theme-bootstrap-blog/master/theme_screenshot.png',
      url:   'https://github.com/snide/webhook-theme-bootstrap-blog/archive/master.zip',
      demo:  'http://daveblog.webhook.org',
      code:  'https://github.com/snide/webhook-theme-bootstrap-blog',
      description: 'Installs a very basic blog using Bootstrap for some minimal styling. Also loads in some starter forms.'
    },
    {
      name:  'Wyrm Sass',
      image: 'https://raw.githubusercontent.com/webhook/webhook-theme-wyrm/master/static/images/theme-screenshot.png',
      url:   'https://github.com/webhook/webhook-theme-wyrm/archive/master.zip',
      demo:  'http://www.wyrmsass.org',
      code:  'https://github.com/webhook/webhook-theme-wyrm',
      description: 'Installs boilerplate templates for the Wyrm Sass framework. Requires bower to use.'
    }
  ],
  controlTypeGroups: [
    {
      name: 'Text',
      controlTypes: [
        {
          name     : 'Single line text',
          iconClass: 'icon-font',
          widget   : 'textfield'
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
          iconClass: 'icon-markdown-mark',
          widget   : 'markdown',
          help     : 'Learn about Markdown syntax <a href="http://guides.github.com/overviews/mastering-markdown/" target="_blank">here</a>'
        }
      ]
    }, {
      name: 'Basics',
      controlTypes: [
        {
          name     : 'Number',
          widget   : 'number',
          iconClass: 'icon-list-ol'
        },
        {
          name     : 'Checkbox',
          widget   : 'checkbox',
          iconClass: 'icon-checkbox-checked'
        },
        {
          name     : 'Multiple choice',
          widget   : 'radio',
          iconClass: 'icon-radio-checked'
        },
        {
          name     : 'Dropdown',
          widget   : 'select',
          iconClass: 'icon-menu'
        }
      ]
    }, {
      name: 'Files',
      controlTypes: [
        {
          name     : 'Image',
          widget   : 'image',
          valueType: 'object',
          iconClass: 'icon-image'
        },
        {
          name     : 'Gallery',
          widget   : 'gallery',
          iconClass: 'icon-images'
        },
        {
          name     : 'Audio file',
          widget   : 'audio',
          valueType: 'object',
          iconClass: 'icon-music'
        },
        {
          name     : 'Other file',
          widget   : 'file',
          valueType: 'object',
          iconClass: 'icon-paper-clip'
        }
      ]
    }, {
      name: 'Specifics',
      controlTypes: [
        {
          name     : 'Person',
          widget   : 'name',
          valueType: 'object',
          iconClass: 'icon-user'
        },
        {
          name     : 'Address',
          widget   : 'address',
          valueType: 'object',
          iconClass: 'icon-direction'
        },
        {
          name     : 'Phone number',
          widget   : 'phone',
          iconClass: 'icon-phone-sign'
        },
        {
          name     : 'Email',
          widget   : 'email',
          iconClass: 'icon-envelop'
        },
        {
          name     : 'Date time',
          widget   : 'datetime',
          iconClass: 'icon-calendar'
        },
        {
          name       : 'Website',
          widget     : 'url',
          label      : 'Website',
          placeholder: 'http://www.sitename.com',
          iconClass  : 'icon-link'
        },
        {
          name     : 'Rating',
          widget   : 'rating',
          iconClass: 'icon-star'
        },
        {
          name     : 'Tabular Data',
          widget   : 'tabular',
          iconClass: 'icon-table',
          valueType: 'object'
        },
        // {
        //   name     : 'Tags',
        //   widget   : 'tag',
        //   iconClass: 'icon-tags'
        // },
        {
          name     : 'Embed.ly',
          widget   : 'embedly',
          valueType: 'object',
          iconClass: 'icon-code'
        },
        {
          name     : 'Color',
          widget   : 'color',
          iconClass: 'icon-droplet'
        },
        {
          name     : 'Relationship',
          widget   : 'relation',
          iconClass: 'icon-tags'
        }
      ]
    }
  ]
};
