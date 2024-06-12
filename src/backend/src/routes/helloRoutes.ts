import express from 'express';
import {
  getHello,
} from '../controllers/HelloController';

const router = express.Router();

router.get('/', getHello);

export default router;