export const QUILL_FORMATS = [
  'header',
  'bold',
  'italic',
  'underline',
  'strike',
  'list',
  'indent',
  'align',
  'color',
  'background',
  'blockquote',
  'code-block',
  'link',
];

export const QUILL_MODULES = {
  history: {
    delay: 500,
    maxStack: 100,
    userOnly: true,
  },
  toolbar: {
    container: [
      ['undo', 'redo'],
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ color: [] }, { background: [] }],
      [{ align: [] }],
      [{ indent: '-1' }, { indent: '+1' }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['blockquote', 'code-block', 'link'],
      ['clean'],
    ],
    handlers: {
      undo() {
        this.quill.history.undo();
      },
      redo() {
        this.quill.history.redo();
      },
    },
  },
};

export default {
  QUILL_FORMATS,
  QUILL_MODULES,
};
