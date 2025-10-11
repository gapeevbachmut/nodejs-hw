import { Note } from '../models/note.js';
import createHttpError from 'http-errors';

// Отримати список усіх нотаток
export const getAllNotes = async (req, res) => {
  const {
    page = 1,
    perPage = 10,
    tag,
    search,
    sortBy = 'title',
    sortOrder = 'asc',
  } = req.query;

  const skip = (page - 1) * perPage;

  const notesQuery = Note.find();

  if (search && search.trim() !== '') {
    // швидше - повне слово
    notesQuery.where({ $text: { $search: search.trim() } });
  }

  // if (search && search.trim() !== '') {
  //   // довше - підрядок
  //   const regex = new RegExp(search, 'i');
  //   notesQuery.or([{ title: regex }, { content: regex }]);
  // }

  if (tag) {
    notesQuery.where('tag').equals(tag);
  }

  const [totalNotes, notes] = await Promise.all([
    notesQuery.clone().countDocuments(),
    notesQuery
      .skip(skip)
      .limit(perPage)
      .sort({ [sortBy]: sortOrder }),
  ]);

  const totalPages = Math.ceil(totalNotes / perPage);

  res.status(200).json({
    page,
    perPage,
    totalNotes,
    totalPages,
    notes,
  });
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
    // throw createHttpError(404, 'Note not found');
  }
  res.status(200).json(note);
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
    next(createHttpError(404, 'Note not found'));
    return;
    // throw createHttpError(404, 'Note not found');
  }
  res.status(200).json(note);
};
