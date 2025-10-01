import { Note } from '../models/note.js';
import createHttpError from 'http-errors';

// Отримати список усіх нотаток
export const getAllNotes = async (req, res) => {
  const notes = await Note.find();
  res.status(200).json(notes);
};

// Отримати одну нотатку за id
export const getNoteById = async (req, res, next) => {
  const { noteId } = req.params;
  const note = await Note.findById(noteId);

  if (!note) {
    next(createHttpError(404, 'Note not found'));
    return;
  }

  res.status(200).json(note);
};

//  створення нотатки
export const createNote = async (req, res) => {
  const note = await Note.create(req.body);
  res.status(201).json(note);
};

// видалення
export const deleteNote = async (req, res, next) => {
  const { noteId } = req.params;
  const note = await Note.findByIdAndDelete(noteId);

  if (!note) {
    next(createHttpError(404, 'Note not found'));
    return;
  }
  res.status(200).send(note);
};

//редагування
export const updateNote = async (req, res, next) => {
  const { noteId } = req.params;
  const note = await Note.findOneAndUpdate(
    { _id: noteId },
    req.body,
    { new: true }, //show update
  );
  if (!note) {
    next(createHttpError, 'Note not found');
  }
  res.status(200).json(note);
};
