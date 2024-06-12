import { Request, Response } from 'express';
import HelloService from '../services/HelloService';

const helloService = new HelloService();

export const getHello = async (req: Request, res: Response) => {
  try {
    const hello = await helloService.getHello();
    res.status(200).json(hello);
  } catch (e) {
    if (e instanceof Error) {
      res.status(500).json({ message: e.message });
    }
  }
};