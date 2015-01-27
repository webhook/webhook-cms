// Put general configuration here. This file is included
// in both production and development BEFORE Ember is
// loaded.
//
// For example to enable a feature on a canary build you
// might do:
//
// window.ENV = {FEATURES: {'with-controller': true}};

window.ENV = window.ENV || {};
window.ENV = {
  dbName: window.ENV.dbName || 'webhook',
  uploadUrl: window.ENV.uploadUrl || 'http://server.webhook.com/',
  embedlyKey: window.ENV.embedlyKey || '13dde81b8137446e89c7933edca679eb',
  selfHosted: window.ENV.selfHosted || false,
  displayUrl : 'https://i.embed.ly/1/display/',

  themes: [
    {
      name:  'Tumble Blog (Markdown)',
      image: 'https://raw.githubusercontent.com/webhook/webhook-theme-solo/master/static/images/theme-screenshot.png',
      url:   'https://github.com/webhook/webhook-theme-solo/archive/master.zip',
      demo:  'http://solo-data.webhook.org',
      code:  'https://github.com/webhook/webhook-theme-solo',
      description: 'Tumble blog for solo bloggers that includes video, galleries and your work resume. Can be hooked up to the API to slurp in content from YouTube, Vimeo, Twitter, Pinboard ...etc. Uses Markdown for posts.'
    },
    {
      name:  'Tumble Blog (WYSIWYG)',
      image: 'https://raw.githubusercontent.com/webhook/webhook-theme-solo/master/static/images/theme-screenshot.png',
      url:   'https://github.com/webhook/webhook-theme-solo/archive/wysiwyg.zip',
      demo:  'http://solo-data.webhook.org',
      code:  'https://github.com/webhook/webhook-theme-solo/tree/wysiwyg',
      description: 'Tumble blog for solo bloggers that includes video, galleries and your work resume. Can be hooked up to the API to slurp in content from YouTube, Vimeo, Twitter, Pinboard ...etc. Uses WYSIWYG for posts.'
    },
    {
      name:  'Podcast & blog',
      image: 'https://raw.githubusercontent.com/webhook/webhook-theme-podcast/master/static/images/theme-screenshot.png',
      url:   'https://github.com/webhook/webhook-theme-podcast/archive/master.zip',
      demo:  'http://www.dadstrength.tv',
      code:  'https://github.com/webhook/webhook-theme-podcast',
      description: 'Podcast theme with simple blog. Comes with a persistant audio player and iTunes formatted RSS.'
    },
    {
      name:  'Video, livestream & blog',
      image: 'https://raw.githubusercontent.com/webhook/webhook-theme-streamer/master/static/images/theme-screenshot.png',
      url:   'https://github.com/webhook/webhook-theme-streamer/archive/master.zip',
      demo:  'http://webhook-theme-streamer.webhook.org',
      code:  'https://github.com/webhook/webhook-theme-streamer',
      description: 'Theme for video producers who manage multiple shows across YouTube, Vimeo and Twitch.'
    },
    {
      name:  'Simple personality site',
      image: 'http://webhook-theme-internet-presence.webhook.org/static/images/theme.jpg',
      url:   'https://github.com/webhook/webhook-theme-internet-presence/archive/master.zip',
      demo:  'http://webhook-theme-internet-presence.webhook.org',
      code:  'https://github.com/webhook/webhook-theme-internet-presence',
      description: 'Theme for individuals that need a simple site to manage their online presence, previous work, upcoming events and blog.'
    },
    {
      name:  'Preprocessors built in',
      image: 'https://raw.githubusercontent.com/webhook/webhook-theme-preprocessor/master/theme.png',
      url:   'https://github.com/webhook/webhook-theme-preprocessor/archive/master.zip',
      code:  'https://github.com/webhook/webhook-theme-preprocessor',
      description: 'This theme will automatically add popular CSS and JS preprocessors to your site. Once installed, you\'ll need to restart your runserver.'
    },
    {
      name:  'Foundation',
      image: 'https://raw.githubusercontent.com/webhook/webhook-theme-foundation/master/static/images/theme-screenshot.png',
      url:   'https://github.com/webhook/webhook-theme-foundation/archive/master.zip',
      demo:  'http://foundation.zurb.com',
      code:  'https://github.com/webhook/webhook-theme-foundation',
      description: 'Loads the Foundation 5 source JS and SASS files and sets up a simple watch command to build new CSS.'
    },
    {
      name:  'Bootstrap',
      image: 'https://raw.githubusercontent.com/webhook/webhook-theme-bootstrap/master/theme-screenshot.png',
      url:   'https://github.com/webhook/webhook-theme-bootstrap/archive/master.zip',
      demo:  'http://getbootstrap.com',
      code:  'https://github.com/webhook/webhook-theme-bootstrap',
      description: 'Loads the Bootstrap source JS and LESS files and sets up a simple watch command to build new CSS.'
    },
    {
      name:  'Wyrm sass',
      image: 'https://raw.githubusercontent.com/webhook/webhook-theme-wyrm/master/static/images/theme-screenshot.png',
      url:   'https://github.com/webhook/webhook-theme-wyrm/archive/master.zip',
      demo:  'http://www.wyrmsass.org',
      code:  'https://github.com/webhook/webhook-theme-wyrm',
      description: 'Installs boilerplate templates for the Wyrm Sass framework. Requires bower.js and Sass to use. Check github for installation instructions.'
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
          iconClass: 'icon-checkbox-checked',
          valueType: 'array'
        },
        {
          name     : 'Multiple choice',
          widget   : 'radio',
          iconClass: 'icon-radio-checked'
        },
        {
          name     : 'Switch',
          widget   : 'boolean',
          iconClass: 'icon-ok-sign'
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
          iconClass: 'icon-images',
          valueType: 'array'
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
          name     : 'Geolocation',
          widget   : 'geolocation',
          valueType: 'object',
          iconClass: 'icon-marker'
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
        }
      ]
    }, {
      name: 'Advanced',
      controlTypes: [
        {
          name: 'Grid',
          widget: 'grid',
          valueType: 'array',
          iconClass: 'icon-th-list'
        },
        {
          name: 'Instructions',
          widget: 'instruction',
          iconClass: 'icon-question-sign'
        },
        {
          name     : 'Relationship',
          widget   : 'relation',
          iconClass: 'icon-tags',
          valueType: 'array'
        },
        {
          name: 'Page Layout',
          widget: 'layout',
          iconClass: 'icon-file-xml'
        }
      ]
    }
  ]
};
