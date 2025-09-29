import { Note } from '../models/note.js';
import createHttpError from 'http-errors';

// Отримати список усіх нотаток
export const getNotes = async (req, res) => {
  const notes = await Note.find();
  res.status(200).json(notes);
};

// Отримати одну нотатку за id
export const getNoteById = async (req, res, next) => {
  const { noteId } = req.params;
  const note = await Note.findById(noteId);

  if (!note) {
    // throw createHttpError(404, 'Note not found');
    next(createHttpError(404, 'Note not found'));
    return;
    // return res.status(404).json({ message: 'Note not found' });
  }

  res.status(200).json(note);
};

//  створення нотатки
export const createNote = async (req, res) => {
  const note = await Note.create(req.body);
  res.status(201).json(note);
};
