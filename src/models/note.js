import { Schema, model } from 'mongoose';

const noteSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: false,
      default: '',
    },
    tag: {
      type: String,
      required: false,
      default: 'Todo',
      enum: [
        'Work',
        'Personal',
        'Meeting',
        'Shopping',
        'Ideas',
        'Travel',
        'Finance',
        'Health',
        'Important',
        'Todo',
      ],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

noteSchema.index(
  { title: 'text', content: 'text' },
  {
    name: 'noteTextIndex',
    weights: { title: 10, content: 5 },
    default_language: 'english',
  },
);

export const Note = model('Note', noteSchema);
