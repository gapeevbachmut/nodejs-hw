import { Router } from 'express';
import {
  getAllNotes,
  getNoteById,
  createNote,
  deleteNote,
  updateNote,
} from '../controllers/notesController.js';

const router = Router();

router.get('/notes', getAllNotes); // all notes
router.get('/notes/:noteId', getNoteById); // note by id

router.post('/notes', createNote); // create note
router.delete('/notes/:noteId', deleteNote); // видалення
router.patch('/notes/:noteId', updateNote); // редагування

export default router;
