import { Schema, model } from 'mongoose';
import { TAGS } from '../constants/tags';

const noteSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: false,
      default: '',
      trim: true,
    },
    tag: {
      type: String,
      required: false,
      default: 'Todo',
      enum: [TAGS],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// noteSchema.index(
//   { title: 'text', content: 'text' },
//   {
//     name: 'noteTextIndex',
//     weights: { title: 10, content: 5 },
//     default_language: 'english',
//   },
// );

export const Note = model('Note', noteSchema);
