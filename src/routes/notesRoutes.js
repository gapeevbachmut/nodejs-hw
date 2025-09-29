import { Router } from 'express';
import {
  createNote,
  getNoteById,
  getNotes,
} from '../controllers/notesController.js';

const router = Router();

router.get('/notes', getNotes); // all notes
router.get('/notes/:noteId', getNoteById); // note by id
router.post('/notes', createNote); // create note

export default router;
