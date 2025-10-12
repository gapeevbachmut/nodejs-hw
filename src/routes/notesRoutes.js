import { Router } from 'express';
import { celebrate } from 'celebrate';
import {
  getAllNotes,
  getNoteById,
  createNote,
  deleteNote,
  updateNote,
} from '../controllers/notesController.js';
import {
  getAllNotesSchema,
  noteIdSchema,
  createNoteSchema,
  updateNoteSchema,
} from '../validations/notesValidation.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

router.use('/notes', authenticate); //  додаю автентифікацію до всіх маршрутів /notes

router.get('/notes', celebrate(getAllNotesSchema), getAllNotes); // all notes
router.get('/notes/:noteId', celebrate(noteIdSchema), getNoteById); // note by id

router.post('/notes', celebrate(createNoteSchema), createNote); // create note

router.delete('/notes/:noteId', celebrate(noteIdSchema), deleteNote); // видалення
router.patch('/notes/:noteId', celebrate(updateNoteSchema), updateNote); // редагування

export default router;
