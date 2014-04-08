import FileUploadComponent from 'appkit/components/file-upload';

export default FileUploadComponent.extend({
  selectAccept  : 'audio/*',
  defaultClasses: 'icon-music',
  successMsg    : ' Audio upload complete.',

  actions: {
    audioLoaded: function (audio) {
      this.set('control.value.duration', audio.duration);
    }
  }
});
